import { Baby, Facebook, Instagram, Twitter, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center">
                <Baby size={20} className="text-white" />
              </div>
              <span className="text-xl font-extrabold text-white">
                Peque<span className="text-sky-400">World</span>
              </span>
            </div>
            <p className="text-sm text-gray-400 mb-4 max-w-sm">
              Tu tienda de confianza para todo lo que tus pequeños necesitan.
              Productos seguros, divertidos y educativos.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="#"
                className="w-9 h-9 bg-gray-800 hover:bg-sky-500 rounded-lg flex items-center justify-center transition-colors"
              >
                <Facebook size={18} />
              </a>
              <a
                href="#"
                className="w-9 h-9 bg-gray-800 hover:bg-sky-500 rounded-lg flex items-center justify-center transition-colors"
              >
                <Instagram size={18} />
              </a>
              <a
                href="#"
                className="w-9 h-9 bg-gray-800 hover:bg-sky-500 rounded-lg flex items-center justify-center transition-colors"
              >
                <Twitter size={18} />
              </a>
              <a
                href="mailto:contacto@pequeworld.com"
                className="w-9 h-9 bg-gray-800 hover:bg-sky-500 rounded-lg flex items-center justify-center transition-colors"
              >
                <Mail size={18} />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-bold mb-4">Comprar</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-sky-400 transition-colors">
                  Juguetes
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-sky-400 transition-colors">
                  Ropa
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-sky-400 transition-colors">
                  Libros
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-sky-400 transition-colors">
                  Ofertas
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-bold mb-4">Contacto</h3>
            <ul className="space-y-2 text-sm">
              <li>Bogotá, Colombia</li>
              <li>
                <a
                  href="tel:+573001234567"
                  className="hover:text-sky-400 transition-colors"
                >
                  +57 300 123 4567
                </a>
              </li>
              <li>
                <a
                  href="mailto:contacto@pequeworld.com"
                  className="hover:text-sky-400 transition-colors"
                >
                  contacto@pequeworld.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} PequeWorld. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
