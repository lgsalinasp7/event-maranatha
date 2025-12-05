import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <main className="flex flex-col items-center gap-8 max-w-2xl w-full">
        <div className="flex flex-col items-center gap-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight">
            Event Maranatha
          </h1>
          <p className="text-lg text-muted-foreground">
            Aplicación creada con Next.js, Tailwind CSS y shadcn/ui
          </p>
        </div>
        
        <div className="flex flex-wrap gap-4 justify-center">
          <Button>Botón Principal</Button>
          <Button variant="secondary">Secundario</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructivo</Button>
        </div>

        <div className="mt-8 p-6 border rounded-lg bg-card">
          <h2 className="text-xl font-semibold mb-2">Tecnologías configuradas:</h2>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Next.js 16 con App Router</li>
            <li>TypeScript</li>
            <li>Tailwind CSS v4</li>
            <li>shadcn/ui (sistema de diseño)</li>
            <li>Lucide React (iconos)</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
