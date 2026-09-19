import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Heading,
  Text,
  Flex,
  Icon,
  Spinner,
  Badge,
  Stack,
} from "@chakra-ui/react";
import { FaCalendarAlt, FaMapMarkerAlt } from "react-icons/fa";
import api from "../api/api";

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const EventDetail = () => {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .get(`/events/${eventId}`)
      .then((res) => setEvent(res.data))
      .catch(() => setError("Could not load this event"))
      .finally(() => setLoading(false));
  }, [eventId]);

  if (loading) {
    return (
      <Flex justify="center" py={20}>
        <Spinner />
      </Flex>
    );
  }

  if (error || !event) {
    return (
      <Box maxW="800px" mx="auto" p={8}>
        <Text color="red.500">{error || "Event not found"}</Text>
      </Box>
    );
  }

  return (
    <Box maxW="800px" mx="auto" p={{ base: 4, md: 8 }}>
      <Box
        h="280px"
        borderRadius="8px"
        overflow="hidden"
        bgImage={event.imageUrl ? `url(${event.imageUrl})` : undefined}
        bgSize="cover"
        bgPosition="center"
        bgGradient={!event.imageUrl ? "linear(135deg, brand.primary, #4a6fe0)" : undefined}
        mb={6}
      />
      <Heading as="h1" fontSize="2xl" mb={2}>
        {event.name}
      </Heading>
      <Flex align="center" color="gray.600" fontSize="sm" gap={1} mb={1}>
        <Icon as={FaCalendarAlt} />
        <Text>{formatDate(event.date)}</Text>
      </Flex>
      {event.venueName && (
        <Flex align="center" color="gray.600" fontSize="sm" gap={1} mb={4}>
          <Icon as={FaMapMarkerAlt} />
          <Text>
            {event.venueName}
            {event.venueLocation ? ` — ${event.venueLocation}` : ""}
          </Text>
        </Flex>
      )}
      {event.description && (
        <Text color="gray.700" mb={6}>
          {event.description}
        </Text>
      )}

      <Heading as="h2" fontSize="lg" mb={3}>
        Tickets
      </Heading>
      <Stack spacing={3}>
        {(event.ticketTypes || []).map((tt) => (
          <Flex
            key={tt.id}
            justify="space-between"
            align="center"
            p={4}
            border="1px solid"
            borderColor="gray.200"
            borderRadius="6px"
          >
            <Box>
              <Text fontWeight="bold">{tt.name}</Text>
              <Text fontSize="sm" color="gray.500">
                {tt.quantityAvailable > 0
                  ? `${tt.quantityAvailable} available`
                  : "Sold out"}
              </Text>
            </Box>
            <Badge
              colorScheme={tt.quantityAvailable > 0 ? "blue" : "gray"}
              fontSize="0.9em"
              px={3}
              py={1}
              borderRadius="4px"
            >
              ${tt.price.toFixed(2)}
            </Badge>
          </Flex>
        ))}
        {(!event.ticketTypes || event.ticketTypes.length === 0) && (
          <Text color="gray.500">No ticket types listed for this event yet.</Text>
        )}
      </Stack>
    </Box>
  );
};

export default EventDetail;
