import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  handleLogout: () => Promise<void>;
}

const LogoutModal = ({ isOpen, onClose, handleLogout }: LogoutModalProps) => {
  const { t } = useTranslation();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCentered
      closeOnOverlayClick={false}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{t('LOGOUT_MODAL_HEADER')}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>{t('LOGOUT_MODAL_HINT')}</ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={handleLogout}>
            {t('LOGOUT_MODAL_CONFIRM')}
          </Button>
          <Button onClick={onClose}>{t('LOGOUT_MODAL_CANCEL')}</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default LogoutModal;
