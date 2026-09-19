import React, { useEffect, useState } from "react";
import {
  Box,
  SimpleGrid,
  Heading,
  Text,
  Flex,
  Icon,
  Spinner,
  Link,
} from "@chakra-ui/react";
import { FaCalendarAlt, FaMapMarkerAlt } from "react-icons/fa";
import api from "../api/api";

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const EventCard = ({ event }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      href={`/events/${event.id}`}
      _hover={{ textDecoration: "none" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Box
        borderRadius="8px"
        overflow="hidden"
        bg="white"
        boxShadow={hovered ? "lg" : "0 1px 3px rgba(0,0,0,0.12)"}
        transition="box-shadow 0.2s ease, transform 0.2s ease"
        transform={hovered ? "translateY(-2px)" : "none"}
      >
        <Box
          h="200px"
          bgImage={event.imageUrl ? `url(${event.imageUrl})` : undefined}
          bgSize="cover"
          bgPosition="center"
          bgGradient={!event.imageUrl ? "linear(135deg, brand.primary, #4a6fe0)" : undefined}
        />
        <Box p={4}>
          <Text fontWeight="bold" fontSize="lg" color="brand.primary" noOfLines={2}>
            {event.name}
          </Text>
          <Flex align="center" color="gray.500" fontSize="sm" gap={1} mt={1}>
            <Icon as={FaCalendarAlt} boxSize={3} />
            <Text>{formatDate(event.date)}</Text>
          </Flex>
          {event.venueName && (
            <Flex align="center" color="gray.500" fontSize="sm" gap={1} mt={1}>
              <Icon as={FaMapMarkerAlt} boxSize={3} />
              <Text>
                {event.venueName}
                {event.venueLocation ? ` — ${event.venueLocation}` : ""}
              </Text>
            </Flex>
          )}
        </Box>
      </Box>
    </Link>
  );
};

const Home = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .get("/events")
      .then((res) => setEvents(res.data))
      .catch(() => setError("Could not load events"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box maxW="1100px" mx="auto" p={{ base: 4, md: 8 }}>
      <Heading as="h1" fontSize="2xl" mb={6}>
        Upcoming Events
      </Heading>

      {loading && (
        <Flex justify="center" py={16}>
          <Spinner />
        </Flex>
      )}

      {error && <Text color="red.500">{error}</Text>}

      {!loading && !error && events.length === 0 && (
        <Text color="gray.500">No events available right now.</Text>
      )}

      <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={6}>
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default Home;
