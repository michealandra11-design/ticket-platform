import React from "react";
import { Flex, Box, Link } from "@chakra-ui/react";

const Header = () => {
  return (
    <Flex bg="brand.primary" w="100%" p={3} alignItems="center" justify="space-between">
      <Link href="/" _hover={{ textDecoration: "none" }}>
        <Box fontWeight="bold" fontSize="2xl" color="brand.secondary">
          ticketplatform
        </Box>
      </Link>
      <Link href="/admin" color="brand.secondary" fontSize="sm" opacity={0.85}>
        Admin
      </Link>
    </Flex>
  );
};

export default Header;
