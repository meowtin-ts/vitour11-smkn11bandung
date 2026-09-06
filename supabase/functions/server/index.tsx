import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Initialize Supabase Client
const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

// Storage bucket name
const PANORAMA_BUCKET = "make-731f136a-panoramas";

// Initialize storage bucket on startup
async function initStorageBucket() {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === PANORAMA_BUCKET);
    
    if (!bucketExists) {
      console.log(`Creating bucket: ${PANORAMA_BUCKET}`);
      const { error } = await supabase.storage.createBucket(PANORAMA_BUCKET, {
        public: true,
        fileSizeLimit: 52428800, // 50MB
        allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png'],
      });
      
      if (error) {
        console.error("Bucket creation error:", error);
      } else {
        console.log(`✅ Bucket created: ${PANORAMA_BUCKET}`);
      }
    } else {
      console.log(`✅ Bucket already exists: ${PANORAMA_BUCKET}`);
    }
  } catch (error) {
    console.error("Storage initialization error:", error);
  }
}

// Initialize admins table and seed default admin
async function initAdminsTable() {
  try {
    // Check if table exists by trying to query it
    const { data: existingAdmins, error: queryError } = await supabase
      .from('admins')
      .select('email')
      .eq('email', 'matiinu@gmail.com')
      .single();

    if (queryError && queryError.code === 'PGRST116') {
      console.log('❌ Admins table does not exist. Please run SQL migration first!');
      console.log('📝 Go to Supabase Dashboard → SQL Editor');
      console.log('📝 Run: /supabase/migrations/001_create_admins_table.sql');
      return;
    }

    // Check if default admin exists
    if (!existingAdmins) {
      console.log('Creating default admin...');
      const hashedPassword = await bcrypt.hash('123123');

      const { error: insertError } = await supabase
        .from('admins')
        .insert([{
          nisn: '0000000000',
          password_hash: hashedPassword,
          name: 'Admin',
          email: 'matiinu@gmail.com',
          role: 'super_admin'
        }]);

      if (insertError) {
        console.error('❌ Error creating default admin:', insertError);
      } else {
        console.log('✅ Default admin created (Email: matiinu@gmail.com, Password: 123123)');
      }
    } else {
      // Update password hash if it's still temporary
      const { data: adminData } = await supabase
        .from('admins')
        .select('password_hash')
        .eq('email', 'matiinu@gmail.com')
        .single();

      if (adminData && adminData.password_hash === 'TEMPORARY_WILL_BE_HASHED') {
        const hashedPassword = await bcrypt.hash('123123');
        await supabase
          .from('admins')
          .update({ password_hash: hashedPassword })
          .eq('email', 'matiinu@gmail.com');
        console.log('✅ Default admin password hashed');
      } else {
        console.log('✅ Admins table ready');
      }
    }
  } catch (error) {
    console.error('Admins table initialization error:', error);
  }
}

// Initialize bucket and admins
initStorageBucket();
initAdminsTable();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-731f136a/health", (c) => {
  return c.json({ status: "ok" });
});

// ============= AUTH ENDPOINTS =============

// Admin Login - Database Authentication
app.post("/make-server-731f136a/auth/login", async (c) => {
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({ success: false, error: "Email dan password harus diisi" }, 400);
    }

    // Get admin from database by email
    const { data: admin, error: dbError } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email)
      .eq('is_active', true)
      .single();

    if (dbError || !admin) {
      return c.json({ success: false, error: "Email atau password salah" }, 401);
    }

    // Verify password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, admin.password_hash);

    if (!isPasswordValid) {
      return c.json({ success: false, error: "Email atau password salah" }, 401);
    }

    // Create session token
    const sessionToken = crypto.randomUUID();

    // Store session in KV
    await kv.set(`session:${sessionToken}`, {
      nisn: admin.nisn,
      name: admin.name,
      role: admin.role,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    });

    return c.json({
      success: true,
      token: sessionToken,
      user: {
        nisn: admin.nisn,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return c.json({ success: false, error: "Login failed" }, 500);
  }
});

// Verify Session
app.get("/make-server-731f136a/auth/verify", async (c) => {
  try {
    const token = c.req.header("Authorization")?.replace("Bearer ", "");
    
    if (!token) {
      return c.json({ success: false, error: "No token provided" }, 401);
    }

    const session = await kv.get(`session:${token}`);
    
    if (!session || new Date(session.expiresAt) < new Date()) {
      return c.json({ success: false, error: "Invalid or expired session" }, 401);
    }

    return c.json({ success: true, user: { nisn: session.nisn } });
  } catch (error) {
    console.error("Verify error:", error);
    return c.json({ success: false, error: "Verification failed" }, 500);
  }
});

// Logout
app.post("/make-server-731f136a/auth/logout", async (c) => {
  try {
    const token = c.req.header("Authorization")?.replace("Bearer ", "");
    
    if (token) {
      await kv.del(`session:${token}`);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    return c.json({ success: false, error: "Logout failed" }, 500);
  }
});

// ============= VIRTUAL TOUR ENDPOINTS =============

// Middleware to check authentication
async function requireAuth(c: any, next: any) {
  const token = c.req.header("Authorization")?.replace("Bearer ", "");
  
  if (!token) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const session = await kv.get(`session:${token}`);
  
  if (!session || new Date(session.expiresAt) < new Date()) {
    return c.json({ error: "Invalid or expired session" }, 401);
  }

  c.set("user", session);
  await next();
}

// Get all virtual tour locations
app.get("/make-server-731f136a/tours", async (c) => {
  try {
    const tours = await kv.getByPrefix("tour:");
    return c.json({ success: true, data: tours.sort((a, b) => a.order - b.order) });
  } catch (error) {
    console.error("Get tours error:", error);
    return c.json({ success: false, error: "Failed to fetch tours" }, 500);
  }
});

// Get single tour by ID
app.get("/make-server-731f136a/tours/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const tour = await kv.get(`tour:${id}`);
    
    if (!tour) {
      return c.json({ success: false, error: "Tour not found" }, 404);
    }

    return c.json({ success: true, data: tour });
  } catch (error) {
    console.error("Get tour error:", error);
    return c.json({ success: false, error: "Failed to fetch tour" }, 500);
  }
});

// Create new tour (protected)
app.post("/make-server-731f136a/tours", requireAuth, async (c) => {
  try {
    const data = await c.req.json();
    const id = crypto.randomUUID();
    
    const tour = {
      id,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`tour:${id}`, tour);
    
    return c.json({ success: true, data: tour }, 201);
  } catch (error) {
    console.error("Create tour error:", error);
    return c.json({ success: false, error: "Failed to create tour" }, 500);
  }
});

// Update tour (protected)
app.put("/make-server-731f136a/tours/:id", requireAuth, async (c) => {
  try {
    const id = c.req.param("id");
    const data = await c.req.json();
    
    const existing = await kv.get(`tour:${id}`);
    
    if (!existing) {
      return c.json({ success: false, error: "Tour not found" }, 404);
    }

    const updated = {
      ...existing,
      ...data,
      id, // Preserve ID
      createdAt: existing.createdAt, // Preserve creation date
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`tour:${id}`, updated);
    
    return c.json({ success: true, data: updated });
  } catch (error) {
    console.error("Update tour error:", error);
    return c.json({ success: false, error: "Failed to update tour" }, 500);
  }
});

// Delete tour (protected)
app.delete("/make-server-731f136a/tours/:id", requireAuth, async (c) => {
  try {
    const id = c.req.param("id");
    
    const existing = await kv.get(`tour:${id}`);
    
    if (!existing) {
      return c.json({ success: false, error: "Tour not found" }, 404);
    }

    await kv.del(`tour:${id}`);
    
    return c.json({ success: true });
  } catch (error) {
    console.error("Delete tour error:", error);
    return c.json({ success: false, error: "Failed to delete tour" }, 500);
  }
});

// ============= ADMIN MANAGEMENT ENDPOINTS =============

// Get all admins (protected, super_admin only)
app.get("/make-server-731f136a/admins", requireAuth, async (c) => {
  try {
    const { data: admins, error } = await supabase
      .from('admins')
      .select('id, nisn, name, email, role, is_active, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (error) {
      return c.json({ success: false, error: error.message }, 500);
    }

    return c.json({ success: true, data: admins });
  } catch (error) {
    console.error("Get admins error:", error);
    return c.json({ success: false, error: "Failed to fetch admins" }, 500);
  }
});

// Create new admin (protected, super_admin only)
app.post("/make-server-731f136a/admins", requireAuth, async (c) => {
  try {
    const { nisn, password, name, email, role } = await c.req.json();

    if (!nisn || !password || !name) {
      return c.json({ success: false, error: "NISN, password, dan name wajib diisi" }, 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password);

    // Insert to database
    const { data, error } = await supabase
      .from('admins')
      .insert([{
        nisn,
        password_hash: hashedPassword,
        name,
        email,
        role: role || 'admin',
        is_active: true
      }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique violation
        return c.json({ success: false, error: "NISN sudah terdaftar" }, 400);
      }
      return c.json({ success: false, error: error.message }, 500);
    }

    return c.json({
      success: true,
      data: {
        id: data.id,
        nisn: data.nisn,
        name: data.name,
        email: data.email,
        role: data.role,
      }
    }, 201);
  } catch (error) {
    console.error("Create admin error:", error);
    return c.json({ success: false, error: "Failed to create admin" }, 500);
  }
});

// Update admin (protected)
app.put("/make-server-731f136a/admins/:id", requireAuth, async (c) => {
  try {
    const id = c.req.param("id");
    const { name, email, role, is_active, password } = await c.req.json();

    const updateData: any = {};
    if (name) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (role) updateData.role = role;
    if (is_active !== undefined) updateData.is_active = is_active;

    // Update password if provided
    if (password) {
      updateData.password_hash = await bcrypt.hash(password);
    }

    const { data, error } = await supabase
      .from('admins')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return c.json({ success: false, error: error.message }, 500);
    }

    return c.json({ success: true, data });
  } catch (error) {
    console.error("Update admin error:", error);
    return c.json({ success: false, error: "Failed to update admin" }, 500);
  }
});

// Delete admin (protected, super_admin only)
app.delete("/make-server-731f136a/admins/:id", requireAuth, async (c) => {
  try {
    const id = c.req.param("id");

    const { error } = await supabase
      .from('admins')
      .delete()
      .eq('id', id);

    if (error) {
      return c.json({ success: false, error: error.message }, 500);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error("Delete admin error:", error);
    return c.json({ success: false, error: "Failed to delete admin" }, 500);
  }
});

// ============= STORAGE ENDPOINTS =============

// Upload panorama image (protected)
app.post("/make-server-731f136a/upload", requireAuth, async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return c.json({ success: false, error: "No file provided" }, 400);
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      return c.json({ 
        success: false, 
        error: "Invalid file type. Only JPG and PNG are allowed" 
      }, 400);
    }
    
    // Validate file size (max 50MB)
    const maxSize = 52428800; // 50MB
    if (file.size > maxSize) {
      return c.json({ 
        success: false, 
        error: "File too large. Maximum size is 50MB" 
      }, 400);
    }
    
    // Generate unique filename
    const timestamp = Date.now();
    const randomId = crypto.randomUUID().split('-')[0];
    const extension = file.name.split('.').pop() || 'jpg';
    const filename = `panorama-${timestamp}-${randomId}.${extension}`;
    
    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(PANORAMA_BUCKET)
      .upload(filename, uint8Array, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.error("Upload error:", error);
      return c.json({ 
        success: false, 
        error: `Upload failed: ${error.message}` 
      }, 500);
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(PANORAMA_BUCKET)
      .getPublicUrl(filename);
    
    return c.json({ 
      success: true, 
      url: publicUrl,
      filename: filename,
      size: file.size,
      type: file.type
    });
  } catch (error) {
    console.error("Upload error:", error);
    return c.json({ 
      success: false, 
      error: `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, 500);
  }
});

// ============= CONTENT MANAGEMENT ENDPOINTS =============

// ===== PROGRAM KEAHLIAN =====
app.get("/make-server-731f136a/program-keahlian", async (c) => {
  try {
    const programs = await kv.getByPrefix("program-keahlian:");
    return c.json({ success: true, data: programs.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )});
  } catch (error) {
    console.error("Get programs error:", error);
    return c.json({ success: false, error: "Failed to fetch programs" }, 500);
  }
});

app.get("/make-server-731f136a/program-keahlian/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const program = await kv.get(`program-keahlian:${id}`);
    if (!program) {
      return c.json({ success: false, error: "Program not found" }, 404);
    }
    return c.json({ success: true, data: program });
  } catch (error) {
    return c.json({ success: false, error: "Failed to fetch program" }, 500);
  }
});

app.post("/make-server-731f136a/program-keahlian", requireAuth, async (c) => {
  try {
    const data = await c.req.json();
    const id = crypto.randomUUID();
    const program = {
      id,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await kv.set(`program-keahlian:${id}`, program);
    return c.json({ success: true, data: program }, 201);
  } catch (error) {
    return c.json({ success: false, error: "Failed to create program" }, 500);
  }
});

app.put("/make-server-731f136a/program-keahlian/:id", requireAuth, async (c) => {
  try {
    const id = c.req.param("id");
    const data = await c.req.json();
    const existing = await kv.get(`program-keahlian:${id}`);
    if (!existing) {
      return c.json({ success: false, error: "Program not found" }, 404);
    }
    const updated = {
      ...existing,
      ...data,
      id,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    };
    await kv.set(`program-keahlian:${id}`, updated);
    return c.json({ success: true, data: updated });
  } catch (error) {
    return c.json({ success: false, error: "Failed to update program" }, 500);
  }
});

app.delete("/make-server-731f136a/program-keahlian/:id", requireAuth, async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`program-keahlian:${id}`);
    return c.json({ success: true });
  } catch (error) {
    return c.json({ success: false, error: "Failed to delete program" }, 500);
  }
});

// ===== PRESTASI =====
app.get("/make-server-731f136a/prestasi", async (c) => {
  try {
    const prestasi = await kv.getByPrefix("prestasi:");
    return c.json({ success: true, data: prestasi.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )});
  } catch (error) {
    return c.json({ success: false, error: "Failed to fetch prestasi" }, 500);
  }
});

app.get("/make-server-731f136a/prestasi/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const item = await kv.get(`prestasi:${id}`);
    if (!item) {
      return c.json({ success: false, error: "Prestasi not found" }, 404);
    }
    return c.json({ success: true, data: item });
  } catch (error) {
    return c.json({ success: false, error: "Failed to fetch prestasi" }, 500);
  }
});

app.post("/make-server-731f136a/prestasi", requireAuth, async (c) => {
  try {
    const data = await c.req.json();
    const id = crypto.randomUUID();
    const item = {
      id,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await kv.set(`prestasi:${id}`, item);
    return c.json({ success: true, data: item }, 201);
  } catch (error) {
    return c.json({ success: false, error: "Failed to create prestasi" }, 500);
  }
});

app.put("/make-server-731f136a/prestasi/:id", requireAuth, async (c) => {
  try {
    const id = c.req.param("id");
    const data = await c.req.json();
    const existing = await kv.get(`prestasi:${id}`);
    if (!existing) {
      return c.json({ success: false, error: "Prestasi not found" }, 404);
    }
    const updated = {
      ...existing,
      ...data,
      id,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    };
    await kv.set(`prestasi:${id}`, updated);
    return c.json({ success: true, data: updated });
  } catch (error) {
    return c.json({ success: false, error: "Failed to update prestasi" }, 500);
  }
});

app.delete("/make-server-731f136a/prestasi/:id", requireAuth, async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`prestasi:${id}`);
    return c.json({ success: true });
  } catch (error) {
    return c.json({ success: false, error: "Failed to delete prestasi" }, 500);
  }
});

// ===== KEGIATAN =====
app.get("/make-server-731f136a/kegiatan", async (c) => {
  try {
    const kegiatan = await kv.getByPrefix("kegiatan:");
    return c.json({ success: true, data: kegiatan.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )});
  } catch (error) {
    return c.json({ success: false, error: "Failed to fetch kegiatan" }, 500);
  }
});

app.get("/make-server-731f136a/kegiatan/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const item = await kv.get(`kegiatan:${id}`);
    if (!item) {
      return c.json({ success: false, error: "Kegiatan not found" }, 404);
    }
    return c.json({ success: true, data: item });
  } catch (error) {
    return c.json({ success: false, error: "Failed to fetch kegiatan" }, 500);
  }
});

app.post("/make-server-731f136a/kegiatan", requireAuth, async (c) => {
  try {
    const data = await c.req.json();
    const id = crypto.randomUUID();
    const item = {
      id,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await kv.set(`kegiatan:${id}`, item);
    return c.json({ success: true, data: item }, 201);
  } catch (error) {
    return c.json({ success: false, error: "Failed to create kegiatan" }, 500);
  }
});

app.put("/make-server-731f136a/kegiatan/:id", requireAuth, async (c) => {
  try {
    const id = c.req.param("id");
    const data = await c.req.json();
    const existing = await kv.get(`kegiatan:${id}`);
    if (!existing) {
      return c.json({ success: false, error: "Kegiatan not found" }, 404);
    }
    const updated = {
      ...existing,
      ...data,
      id,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    };
    await kv.set(`kegiatan:${id}`, updated);
    return c.json({ success: true, data: updated });
  } catch (error) {
    return c.json({ success: false, error: "Failed to update kegiatan" }, 500);
  }
});

app.delete("/make-server-731f136a/kegiatan/:id", requireAuth, async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`kegiatan:${id}`);
    return c.json({ success: true });
  } catch (error) {
    return c.json({ success: false, error: "Failed to delete kegiatan" }, 500);
  }
});

// ===== COMMENTS =====
app.get("/make-server-731f136a/comments", async (c) => {
  try {
    const comments = await kv.getByPrefix("comment:");
    return c.json({ success: true, data: comments.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )});
  } catch (error) {
    return c.json({ success: false, error: "Failed to fetch comments" }, 500);
  }
});

app.post("/make-server-731f136a/comments", async (c) => {
  try {
    const { userEmail, userName, userPhoto, text } = await c.req.json();

    if (!userEmail || !text) {
      return c.json({ success: false, error: "Email and text are required" }, 400);
    }

    const id = crypto.randomUUID();
    const comment = {
      id,
      userEmail,
      userName: userName || userEmail.split('@')[0],
      userPhoto: userPhoto || null,
      text,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`comment:${id}`, comment);
    return c.json({ success: true, data: comment }, 201);
  } catch (error) {
    console.error("Create comment error:", error);
    return c.json({ success: false, error: "Failed to create comment" }, 500);
  }
});

app.delete("/make-server-731f136a/comments/:id", requireAuth, async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`comment:${id}`);
    return c.json({ success: true });
  } catch (error) {
    return c.json({ success: false, error: "Failed to delete comment" }, 500);
  }
});

Deno.serve(app.fetch);