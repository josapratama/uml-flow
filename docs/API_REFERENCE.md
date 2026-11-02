# Referensi REST API UML Flow

Server backend UML Flow ditenagai oleh Bun & Hono. Endpoint API melayani kompilasi sintaks DSL, tata letak otomatis (*layouting*), ekspor diagram (SVG/PNG/DSL/JSON), serta penyimpanan diagram terisolasi (*multi-tenant client workspace*).

**Base URL**:  
- Lokal: `http://localhost:3001/api` (atau `http://localhost:3000/api` di Docker)  
- Produksi: `https://uml-flow.josapratama.com/api`

---

## Headers Standar

| Header | Wajib | Keterangan |
|---|---|---|
| `Content-Type` | Ya | `application/json` |
| `x-client-id` | Ya (untuk `/api/diagrams/*`) | Identifier unik workspace klien (misalnya `client_xxxx`). Melindungi diagram agar tidak bisa diakses/diedit oleh sesi lain. |

---

## 1. Kompilasi & Parsing

### `POST /api/compile`
Melakukan proses **Parse + Auto-Layout** dalam satu kali panggilan. Mengubah teks kode DSL menjadi objek diagram lengkap dengan koordinat posisi `x`, `y`, dan ukuran `width`, `height`.

#### Request Body:
```json
{
  "code": "@diagram \"Flow\" flowchart\nstart \"Mulai\" as s\nend \"Selesai\" as e\ns --> e",
  "preset": "auto"
}
```

*Pilihan preset layout opsional:* `"auto"`, `"layered"`, `"linear"`, `"grid"`, `"force"`, `"radial"`.

#### Response (200 OK):
```json
{
  "success": true,
  "diagram": {
    "id": "diagram_1740000000",
    "name": "Flow",
    "type": "flowchart",
    "nodes": [
      {
        "id": "node_start_0",
        "type": "start",
        "name": "Mulai",
        "alias": "s",
        "position": { "x": 281, "y": 60 },
        "size": { "width": 120, "height": 44 }
      },
      {
        "id": "node_end_1",
        "type": "end",
        "name": "Selesai",
        "alias": "e",
        "position": { "x": 281, "y": 156 },
        "size": { "width": 120, "height": 44 }
      }
    ],
    "edges": [
      {
        "id": "edge_s_e_0",
        "source": "node_start_0",
        "target": "node_end_1",
        "type": "flow"
      }
    ],
    "metadata": {
      "createdAt": "2026-11-02T02:00:00.000Z",
      "updatedAt": "2026-11-02T02:00:00.000Z",
      "version": 1
    }
  }
}
```

---

### `POST /api/layout`
Menghitung ulang posisi dan tata letak node pada diagram yang sudah ada berdasarkan preset yang dipilih.

#### Request Body:
```json
{
  "diagram": { /* Objek Diagram */ },
  "preset": "linear"
}
```

---

### `POST /api/parse`
Hanya mem-parsing teks DSL menjadi node dan edge tanpa menghitung tata letak posisi.

#### Request Body:
```json
{
  "code": "class User { +name: string }"
}
```

---

## 2. Ekspor Diagram

### `POST /api/export`
Mengekspor diagram ke format SVG, DSL, atau JSON.

#### Request Body (SVG):
```json
{
  "diagram": { /* Objek Diagram */ },
  "options": {
    "format": "svg",
    "background": "#ffffff"
  }
}
```
*Response*: Dokumen XML `image/svg+xml` dengan fidelitas tinggi sesuai tampilan visual kanvas.

#### Request Body (DSL):
```json
{
  "diagram": { /* Objek Diagram */ },
  "options": {
    "format": "dsl"
  }
}
```
*Response*: Teks string DSL (`text/plain`) yang siap disalin kembali ke editor.

---

## 3. Penyimpanan Diagram (Isolated Workspace CRUD)

Semua endpoint `/api/diagrams` mewajibkan header `x-client-id`.

### `GET /api/diagrams`
Mengambil seluruh daftar diagram yang dimiliki oleh client ID pemanggil.

### `GET /api/diagrams/:id`
Mengambil detail diagram berdasarkan ID. Mengembalikan `403 Forbidden` jika diagram tersebut dimiliki oleh client ID lain.

### `POST /api/diagrams`
Membuat diagram baru.
```json
{
  "name": "Arsitektur Sistem",
  "type": "flowchart",
  "nodes": [],
  "edges": []
}
```

### `PUT /api/diagrams/:id`
Memperbarui diagram yang sudah ada. Menolak update jika diagram milik pengguna lain.

### `DELETE /api/diagrams/:id`
Menghapus diagram milik client pemanggil.

---

## 4. Health Check

### `GET /health` atau `GET /api/health`
Mengembalikan status kesehatan container dan versi API:
```json
{
  "status": "ok",
  "service": "uml-editor-api",
  "version": "2.0.0"
}
```
