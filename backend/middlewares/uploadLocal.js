import multer from 'multer';
import path from 'node:path';

const storageGigi = multer.diskStorage({
    destination: 'gigisFiles',
    filename: (req, file, callback) => {
        console.log(file);
        callback(null, Date.now() + path.extname(file.originalname));

    },
});

const uploadLocal = multer({ storage: storageGigi });

export default uploadLocal;
