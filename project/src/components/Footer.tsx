import { Baby, MapPin, Phone, Mail, Facebook, Instagram, Twitter } from 'lucide-react';
import { useRouter } from '../hooks/useRouter';

export default function Footer() {
  const { navigate } = useRouter();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-sky-500 rounded-xl flex items-center justify-center">
                <Baby size={20} className="text-white" />
              </div>
              <span className="text-xl font-extrabold text-white">
                Peque<span className="text-sky-400">World</span>
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              La tienda de tus pequeños favoritos. Productos seguros, divertidos y de calidad para el desarrollo de tus hijos.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <a href="#" className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-sky-600 transition-colors">
                <Facebook size={15} />
              </a>
              <a href="#" className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-pink-600 transition-colors">
                <Instagram size={15} />
              </a>
              <a href="#" className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-sky-500 transition-colors">
                <Twitter size={15} />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-bold mb-4">Tienda</h3>
            <ul className="space-y-2 text-sm">
              {[
                { label: 'Todos los productos', href: '/products' },
                { label: 'Juguetes', href: '/products?category=juguetes' },
                { label: 'Ropa', href: '/products?category=ropa' },
                { label: 'Libros', href: '/products?category=libros' },
                { label: 'Juegos de Mesa', href: '/products?category=juegos-de-mesa' },
              ].map(link => (
                <li key={link.href}>
                  <button
                    onClick={() => navigate(link.href)}
                    className="hover:text-sky-400 transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="text-white font-bold mb-4">Ayuda</h3>
            <ul className="space-y-2 text-sm">
              {['Preguntas frecuentes', 'Política de envíos', 'Devoluciones', 'Seguimiento de pedidos', 'Contacto'].map(item => (
                <li key={item}>
                  <a href="#" className="hover:text-sky-400 transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-bold mb-4">Contacto</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin size={15} className="text-sky-400 mt-0.5 shrink-0" />
                <span>Av. Principal 123, Ciudad, País</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={15} className="text-sky-400 shrink-0" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={15} className="text-sky-400 shrink-0" />
                <span>hola@pequeworld.com</span>
              </li>
            </ul>
            <div className="mt-4 p-3 bg-gray-800 rounded-xl text-xs text-gray-400">
              <strong className="text-gray-300">Horario de atención:</strong><br />
              Lun - Vie: 9am - 6pm<br />
              Sáb: 10am - 4pm
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>&copy; 2026 PequeWorld. Todos los derechos reservados.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-gray-300 transition-colors">Privacidad</a>
            <a href="#" className="hover:text-gray-300 transition-colors">Términos</a>
            <a href="#" className="hover:text-gray-300 transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
