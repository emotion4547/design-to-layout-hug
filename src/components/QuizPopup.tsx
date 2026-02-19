import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Gift, CalendarHeart, ShieldCheck, ArrowRight, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export const QuizPopup = () => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [birthday, setBirthday] = useState('');
  const [importantDate, setImportantDate] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const alreadyShown = sessionStorage.getItem('quiz_shown');
    if (alreadyShown) return;

    const timer = setTimeout(() => {
      setOpen(true);
      sessionStorage.setItem('quiz_shown', 'true');
    }, 30000);

    return () => clearTimeout(timer);
  }, []);

  const isStep1Valid = name.trim().length > 0 && phone.trim().length >= 7 && birthday.trim().length > 0;
  const isStep2Valid = importantDate.trim().length > 0 && recipientName.trim().length > 0;

  const handleFinish = async () => {
    if (!agreed) return;
    try {
      await supabase.from('quiz_leads').insert([{
        name,
        phone,
        birthday,
        important_date: importantDate,
        recipient_name: recipientName,
      }]);
    } catch (err) {
      console.error('Quiz save error:', err);
    }
    setSubmitted(true);
  };

  const handleClose = () => {
    setOpen(false);
    setStep(1);
    setSubmitted(false);
  };

  const stepIndicator = (
    <div className="flex items-center justify-center gap-2 mb-6">
      {[1, 2, 3].map((s) => (
        <div
          key={s}
          className={`h-2 rounded-full transition-all duration-300 ${
            s === step ? 'w-8 bg-primary' : s < step ? 'w-2 bg-primary/60' : 'w-2 bg-muted-foreground/20'
          }`}
        />
      ))}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden border-none shadow-2xl rounded-2xl">
        <DialogTitle className="sr-only">Бонусный квиз</DialogTitle>
        
        <button
          onClick={handleClose}
          className="absolute right-3 top-3 z-10 rounded-full p-1.5 bg-background/80 backdrop-blur-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {submitted ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Gift className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
              Спасибо, {name}! 🎉
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              1000 бонусов начислены на ваш счёт. Мы напомним вам о важной дате!
            </p>
            <Button onClick={handleClose} className="rounded-full px-6">
              Отлично!
            </Button>
          </div>
        ) : (
          <>
            <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 pb-4">
              {step === 1 && (
                <div className="text-center">
                  <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-3">
                    <Gift className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Дарим 1000 бонусов! 🎁
                  </h3>
                  <p className="text-muted-foreground text-sm">Расскажите немного о себе</p>
                </div>
              )}
              {step === 2 && (
                <div className="text-center">
                  <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-3">
                    <CalendarHeart className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Важные даты под контролем
                  </h3>
                  <p className="text-muted-foreground text-sm">Мы напомним, чтобы вы не забыли поздравить</p>
                </div>
              )}
              {step === 3 && (
                <div className="text-center">
                  <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-3">
                    <ShieldCheck className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Почти готово!
                  </h3>
                  <p className="text-muted-foreground text-sm">Осталось подтвердить согласие</p>
                </div>
              )}
            </div>

            <div className="p-6 pt-2">
              {stepIndicator}

              {step === 1 && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="quiz-name" className="text-sm">Ваше имя</Label>
                    <Input id="quiz-name" placeholder="Как вас зовут?" value={name} onChange={(e) => setName(e.target.value)} className="rounded-lg" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="quiz-phone" className="text-sm">Номер телефона</Label>
                    <Input id="quiz-phone" type="tel" placeholder="+7 (___) ___-__-__" value={phone} onChange={(e) => setPhone(e.target.value)} className="rounded-lg" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="quiz-birthday" className="text-sm">Дата рождения</Label>
                    <Input id="quiz-birthday" type="date" value={birthday} onChange={(e) => setBirthday(e.target.value)} className="rounded-lg" />
                  </div>
                  <Button onClick={() => setStep(2)} disabled={!isStep1Valid} className="w-full rounded-full mt-2">
                    Далее <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="quiz-important-date" className="text-sm">Ближайшая важная дата</Label>
                    <Input id="quiz-important-date" type="date" value={importantDate} onChange={(e) => setImportantDate(e.target.value)} className="rounded-lg" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="quiz-recipient" className="text-sm">Имя получателя</Label>
                    <Input id="quiz-recipient" placeholder="Кого будем поздравлять?" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} className="rounded-lg" />
                  </div>
                  <div className="flex gap-3 mt-2">
                    <Button variant="outline" onClick={() => setStep(1)} className="rounded-full flex-1">Назад</Button>
                    <Button onClick={() => setStep(3)} disabled={!isStep2Valid} className="rounded-full flex-1">
                      Далее <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
                    <p className="mb-3">
                      Нажимая кнопку «Получить бонусы», вы соглашаетесь с{' '}
                      <a href="/privacy" target="_blank" className="text-primary underline hover:no-underline">политикой конфиденциальности</a>{' '}
                      и даёте согласие на обработку персональных данных.
                    </p>
                    <div className="flex items-start gap-3">
                      <Checkbox id="quiz-agree" checked={agreed} onCheckedChange={(v) => setAgreed(v === true)} className="mt-0.5" />
                      <Label htmlFor="quiz-agree" className="text-sm font-normal cursor-pointer leading-snug">
                        Я согласен(а) с политикой конфиденциальности и на обработку персональных данных
                      </Label>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-2">
                    <Button variant="outline" onClick={() => setStep(2)} className="rounded-full flex-1">Назад</Button>
                    <Button onClick={handleFinish} disabled={!agreed} className="rounded-full flex-1">Получить бонусы 🎉</Button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
