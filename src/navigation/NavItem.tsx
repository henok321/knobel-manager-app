import { Box, Flex, FlexProps, Icon } from '@chakra-ui/react';
import { IconType } from '@react-icons/all-files';
import { ReactNode } from 'react';

interface NavItemProps extends FlexProps {
  icon: IconType;
  children: ReactNode;
}

const NavItem = ({ icon, children, ...rest }: NavItemProps) => (
  <Box
    as="a"
    href="#"
    style={{ textDecoration: 'none' }}
    _focus={{ boxShadow: 'none' }}
  >
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
  </Box>
);

export default NavItem;
