import { useTranslation } from 'react-i18next';
import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog.tsx';
import { Button } from '../../components/ui/button.tsx';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  handleLogout: () => Promise<void>;
}

const LogoutModal = ({ isOpen, onClose, handleLogout }: LogoutModalProps) => {
  const { t } = useTranslation();

  return (
    <DialogRoot open={isOpen} onOpenChange={onClose}>
      <DialogTrigger asChild>
        {/* Your trigger component, e.g., a button */}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('LOGOUT_MODAL_HEADER')}</DialogTitle>
          <DialogCloseTrigger />
        </DialogHeader>
        <DialogBody>{t('LOGOUT_MODAL_HINT')}</DialogBody>
        <DialogFooter>
          <Button colorScheme="blue" mr={3} onClick={handleLogout}>
            {t('LOGOUT_MODAL_CONFIRM')}
          </Button>
          <DialogActionTrigger asChild>
            <Button onClick={onClose}>{t('LOGOUT_MODAL_CANCEL')}</Button>
          </DialogActionTrigger>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
};

export default LogoutModal;
