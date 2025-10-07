import { Button } from '@/components/ui/button';
import { Clock, DollarSign, MessageCircle, Facebook, Instagram } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getApiUrl } from '@/lib/api-config';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SideMenu({ isOpen, onClose }: SideMenuProps) {
  const [socialLinks, setSocialLinks] = useState({
    facebook: 'https://facebook.com/brascatta',
    instagram: 'https://instagram.com/brascatta'
  });

  // Buscar dados das redes sociais
  useEffect(() => {
    const fetchSocialLinks = async () => {
      try {
        const adminResponse = await fetch(getApiUrl('/public/settings'));
        
        if (adminResponse.ok) {
          const settings = await adminResponse.json();
          if (settings?.social) {
            setSocialLinks({
              facebook: settings.social.facebook || 'https://facebook.com/brascatta',
              instagram: settings.social.instagram || 'https://instagram.com/brascatta'
            });
          }
        }
      } catch (error) {
        console.log('Usando valores padrão das redes sociais');
      }
    };

    fetchSocialLinks();
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50" data-testid="sidemenu-overlay">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-80 bg-background shadow-xl transform transition-transform duration-300">
        <div className="p-4">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-foreground">Menu</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground p-2"
              data-testid="button-close-sidemenu"
            >
              ×
            </Button>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold text-foreground mb-3">Categorias</h4>
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 p-3"
                  data-testid="button-category-large"
                >
                  <div className="w-1 h-6 bg-primary rounded" />
                  <span className="font-medium">PIZZAS GRANDES</span>
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 p-3"
                data-testid="button-hours"
              >
                <Clock className="text-muted-foreground h-5 w-5" />
                <span className="font-medium text-foreground">Horários de funcionamento</span>
              </Button>
              
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 p-3"
                data-testid="button-payment-methods"
              >
                <DollarSign className="text-muted-foreground h-5 w-5" />
                <span className="font-medium text-foreground">Formas de pagamento</span>
              </Button>
              
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 p-3"
                data-testid="button-whatsapp"
              >
                <MessageCircle className="text-muted-foreground h-5 w-5" />
                <span className="font-medium text-foreground">WhatsApp</span>
              </Button>
            </div>

            <div className="flex items-center justify-center gap-4 pt-6">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-muted-foreground hover:text-primary"
                data-testid="button-facebook"
                onClick={() => window.open(socialLinks.facebook, '_blank')}
              >
                <Facebook className="h-6 w-6" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-muted-foreground hover:text-primary"
                data-testid="button-instagram"
                onClick={() => window.open(socialLinks.instagram, '_blank')}
              >
                <Instagram className="h-6 w-6" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-muted-foreground hover:text-primary"
                data-testid="button-whatsapp-social"
              >
                <MessageCircle className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
