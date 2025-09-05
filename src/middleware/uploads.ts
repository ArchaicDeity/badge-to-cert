import multer from "multer"
import fs from "fs"
import path from "path"

const baseDir = process.env.APP_DATA_DIR || "./data/uploads"

const storage = multer.diskStorage({
  destination: (_req, file, cb) => {
    const dest = path.join(baseDir, file.mimetype === "application/pdf" ? "content" : "")
    fs.mkdirSync(dest, { recursive: true })
    cb(null, dest)
  },
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`)
  }
})

const upload = multer({ storage })

export default upload
