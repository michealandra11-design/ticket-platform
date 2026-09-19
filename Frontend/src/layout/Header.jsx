import React from "react";
import { Flex, Box } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

const Header = () => {
  return (
    <Flex bg="brand.primary" w="100%" p={3} alignItems="center" justify="space-between">
      <Box as={RouterLink} to="/" _hover={{ textDecoration: "none" }}>
        <Box fontWeight="bold" fontSize="2xl" color="brand.secondary">
          ticketplatform
        </Box>
      </Box>
      <Box as={RouterLink} to="/admin" color="brand.secondary" fontSize="sm" opacity={0.85}>
        Admin
      </Box>
    </Flex>
  );
};

export default Header;
