import { Flex, FlexProps, Icon } from '@chakra-ui/react';
import { IconType } from '@react-icons/all-files';
import { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface NavItemProps extends FlexProps {
  icon: IconType;
  children: ReactNode;
  path: string;
}

const NavItem = ({ icon, children, path, ...rest }: NavItemProps) => (
  <Link to={path}>
    <Flex
      align="center"
      p="4"
      mx="4"
      borderRadius="lg"
      role="group"
      cursor="pointer"
      _hover={{
        bg: 'cyan.400',
        color: 'white',
      }}
      {...rest}
    >
      {icon && (
        <Icon
          mr="4"
          fontSize="16"
          _groupHover={{
            color: 'white',
          }}
          as={icon}
        />
      )}
      {children}
    </Flex>
  </Link>
);

export default NavItem;
