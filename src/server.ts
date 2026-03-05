import express from 'express';
import type { Request, Response } from 'express';

const app = express();
const PORT = 3000;

// Aquí aplicamos Tipado Estricto: indicamos que 'req' es de tipo Request 
// y 'res' es de tipo Response. Esto evita errores de escritura.
app.get('/', (req: Request, res: Response) => {
    res.send('Gestor de Tareas: ¡TypeScript iniciado!');
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    console.log('Modo estricto activado. Sin "any" a la vista.');
});