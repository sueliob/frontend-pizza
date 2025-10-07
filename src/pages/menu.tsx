import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  X, 
  Plus, 
  Clock, 
  DollarSign, 
  ChevronRight 
} from 'lucide-react';
import { FaFacebook, FaInstagram, FaTiktok, FaWhatsapp } from 'react-icons/fa';
import { getApiUrl } from '@/lib/api-config';

export default function Menu() {
  const [, navigate] = useLocation();
  const [hoursOpen, setHoursOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
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

  const operatingHours = [
    { day: 'Segunda-feira', hours: '18:00 - 23:00' },
    { day: 'Terça-feira', hours: '18:00 - 23:00' },
    { day: 'Quarta-feira', hours: '18:00 - 23:00' },
    { day: 'Quinta-feira', hours: '18:00 - 23:00' },
    { day: 'Sexta-feira', hours: '18:00 - 00:00' },
    { day: 'Sábado', hours: '18:00 - 00:00' },
    { day: 'Domingo', hours: '18:00 - 23:00' },
  ];

  const paymentMethods = [
    'Cartão de crédito',
    'Cartão de débito',
    'Dinheiro',
    'Pix',
  ];

  return (
    <div className="fixed inset-0 bg-background z-50 fade-in" data-testid="page-menu">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-foreground" data-testid="text-menu-title">
            Menu
          </h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="text-muted-foreground hover:text-foreground p-2"
            data-testid="button-close-menu"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        {/* Categories */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4" data-testid="text-categories-title">
            Categorias
          </h2>
          
          <div className="space-y-3">
            <Button
              onClick={() => navigate('/category/entradas')}
              variant="ghost"
              className="w-full justify-between p-4 h-auto border-l-4 border-orange-500 bg-orange-500/5 hover:bg-orange-500/10"
              data-testid="button-entradas"
            >
              <span className="font-medium text-foreground">ENTRADAS</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">6</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Button>
            
            <Button
              onClick={() => navigate('/category/salgadas')}
              variant="ghost"
              className="w-full justify-between p-4 h-auto border-l-4 border-primary bg-primary/5 hover:bg-primary/10"
              data-testid="button-pizza-salgadas"
            >
              <span className="font-medium text-foreground">PIZZAS SALGADAS</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">12</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Button>
            
            <Button
              onClick={() => navigate('/category/doces')}
              variant="ghost"
              className="w-full justify-between p-4 h-auto border-l-4 border-accent bg-accent/5 hover:bg-accent/10"
              data-testid="button-pizza-doces"
            >
              <span className="font-medium text-foreground">PIZZAS DOCES</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">5</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Button>
            
            <Button
              onClick={() => navigate('/category/bebidas')}
              variant="ghost"
              className="w-full justify-between p-4 h-auto border-l-4 border-blue-500 bg-blue-500/5 hover:bg-blue-500/10"
              data-testid="button-bebidas"
            >
              <span className="font-medium text-foreground">BEBIDAS</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">8</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Button>
          </div>
        </div>

        {/* Operating Hours */}
        <div className="mb-4">
          <Collapsible open={hoursOpen} onOpenChange={setHoursOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-between p-4 h-auto border border-border rounded-lg hover:bg-accent/5"
                data-testid="button-operating-hours"
              >
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium text-foreground">Horários de funcionamento</span>
                </div>
                <Plus className={`h-5 w-5 text-muted-foreground transition-transform ${hoursOpen ? 'rotate-45' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <Card className="border-border">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {operatingHours.map((schedule, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm text-foreground" data-testid={`text-day-${index}`}>
                          {schedule.day}
                        </span>
                        <span className="text-sm font-medium text-primary" data-testid={`text-hours-${index}`}>
                          {schedule.hours}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Payment Methods */}
        <div className="mb-8">
          <Collapsible open={paymentOpen} onOpenChange={setPaymentOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-between p-4 h-auto border border-border rounded-lg hover:bg-accent/5"
                data-testid="button-payment-methods"
              >
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium text-foreground">Formas de pagamento</span>
                </div>
                <Plus className={`h-5 w-5 text-muted-foreground transition-transform ${paymentOpen ? 'rotate-45' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <Card className="border-border">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {paymentMethods.map((method, index) => (
                      <div key={index} className="flex items-center">
                        <span className="text-sm text-foreground" data-testid={`text-payment-${index}`}>
                          {method}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Social Media */}
        <div className="flex justify-center gap-6 mt-12">
          <Button
            variant="ghost"
            size="sm"
            className="p-3 text-muted-foreground hover:text-foreground"
            data-testid="button-facebook"
            onClick={() => window.open(socialLinks.facebook, '_blank')}
          >
            <FaFacebook className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="p-3 text-muted-foreground hover:text-foreground"
            data-testid="button-instagram"
            onClick={() => window.open(socialLinks.instagram, '_blank')}
          >
            <FaInstagram className="h-6 w-6" />
          </Button>
          
        </div>
      </div>
    </div>
  );
}