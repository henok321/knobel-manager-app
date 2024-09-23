import {
  Box,
  BoxProps,
  CloseButton,
  Flex,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { IconType } from '@react-icons/all-files';
import { FiHome } from '@react-icons/all-files/fi/FiHome';
import { FiSettings } from '@react-icons/all-files/fi/FiSettings';
import NavItem from './NavItem.tsx';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

interface LinkItemProps {
  name: string;
  icon: IconType;
  path: string;
}

interface SidebarProps extends BoxProps {
  onClose: () => void;
}

const LinkItems: Array<LinkItemProps> = [
  { name: 'SIDEBAR_ITEM_HOME', icon: FiHome, path: '/' },

  { name: 'SIDEBAR_ITEM_SETTINGS', icon: FiSettings, path: '/settings' },
];

const SidebarContent = ({ onClose, ...rest }: SidebarProps) => {
  const { t } = useTranslation();

  return (
    <Box
      transition="3s ease"
      bg={useColorModeValue('white', 'gray.900')}
      borderRight="1px"
      borderRightColor={useColorModeValue('gray.200', 'gray.700')}
      w={{ base: 'full', md: 60 }}
      pos="fixed"
      h="full"
      {...rest}
    >
      <Flex h="20" alignItems="center" mx="15" justifyContent="space-between">
        <Text fontSize="2xl" fontFamily="monospace" fontWeight="bold">
          {t('SIDEBAR_TITLE')}
        </Text>
        <CloseButton display={{ base: 'flex', md: 'none' }} onClick={onClose} />
      </Flex>
      {LinkItems.map((link) => (
        <Link to={link.path} key={t(link.name)}>
          <NavItem key={t(link.name)} icon={link.icon}>
            {t(link.name)}
          </NavItem>
        </Link>
      ))}
    </Box>
  );
};

export default SidebarContent;