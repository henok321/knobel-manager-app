import { useTranslation } from 'react-i18next';
import { FiChevronDown } from '@react-icons/all-files/fi/FiChevronDown';
import useUser from '../auth/authHook.ts';
import LogoutModal from './modal/LogoutModal.tsx';
import {
  Box,
  Flex,
  Text,
  FlexProps,
  HStack,
  IconButton,
  useDisclosure,
  VStack,
} from '@chakra-ui/react';
import {
  MenuContent,
  MenuItem,
  MenuRoot,
  MenuTrigger,
} from '../components/ui/menu.tsx';
import { Avatar } from '../components/ui/avatar.tsx';
import { FiMenu } from 'react-icons/fi';

interface MobileProps extends FlexProps {
  onOpen: () => void;
}

const Header = ({ onOpen, ...rest }: MobileProps) => {
  const { t } = useTranslation();
  const { logout } = useUser();

  const logoutModal = useDisclosure();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      <Flex
        ml={{ base: 0, md: 60 }}
        px={{ base: 4, md: 4 }}
        height="20"
        alignItems="center"
        borderBottomWidth="1px"
        justifyContent={{ base: 'space-between', md: 'flex-end' }}
        {...rest}
      >
        <IconButton
          display={{ base: 'flex', md: 'none' }}
          onClick={onOpen}
          variant="outline"
          aria-label="open menu"
        >
          <FiMenu />
        </IconButton>

        {t('SIDEBAR_TITLE')}

        <HStack gap={{ base: '0', md: '6' }}>
          <Flex alignItems={'center'}>
            <MenuRoot>
              <MenuTrigger
                py={2}
                transition="all 0.3s"
                _focus={{ boxShadow: 'none' }}
              >
                <HStack>
                  <Avatar
                    size={'sm'}
                    src={
                      'https://images.unsplash.com/photo-1619946794135-5bc917a27793?ixlib=rb-0.3.5&q=80&fm=jpg&crop=faces&fit=crop&h=200&w=200&s=b616b2c5b373a80ffc9636ba24f7a4a9'
                    }
                  />
                  <VStack
                    display={{ base: 'none', md: 'flex' }}
                    alignItems="flex-start"
                    gap="1px"
                    ml="2"
                  >
                    <Text fontSize="sm">Justina Clark</Text>
                    <Text fontSize="xs">Admin</Text>
                  </VStack>
                  <Box display={{ base: 'none', md: 'flex' }}>
                    <FiChevronDown />
                  </Box>
                </HStack>
              </MenuTrigger>
              <MenuContent>
                <MenuItem
                  value={t('SIDEBAR_HEADER_MENU_ITEM_PROFILE')}
                ></MenuItem>
                <MenuItem
                  value={t('SIDEBAR_HEADER_MENU_ITEM_SETTINGS')}
                ></MenuItem>
                <MenuItem
                  value={t('SIDEBAR_HEADER_MENU_ITEM_LOGOUT')}
                ></MenuItem>
              </MenuContent>
            </MenuRoot>
          </Flex>
        </HStack>
      </Flex>
      <LogoutModal
        isOpen={logoutModal.open}
        onClose={logoutModal.onClose}
        handleLogout={handleLogout}
      />
    </>
  );
};

export default Header;
