'use client';

import React, { useMemo, useState } from 'react';
import { Box, SimpleGrid, Input, HStack, Text, Badge, IconButton, useToast, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, InputGroup, InputLeftElement } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import ItemCard from './ItemCard';
import { CATEGORY_META, CATEGORIES, itemsByCategory, CatalogItem, CategoryKey, ItemKey } from './Catalog';

const MotionBox = motion.create(Box);

export type ItemsGridValue = Record<ItemKey, number>;

export type ItemsGridProps = {
  value: ItemsGridValue;
  onChange: (next: ItemsGridValue) => void;
  onChangedKeys?: (keys: ItemKey[]) => void;
};

export default function ItemsGrid(props: ItemsGridProps) {
  const { value, onChange, onChangedKeys } = props;
  const [query, setQuery] = useState('');
  const [recent, setRecent] = useState<ItemKey[]>([]);
  const [newlyAdded, setNewlyAdded] = useState<Set<ItemKey>>(new Set());
  const [isCustomOpen, setCustomOpen] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customQty, setCustomQty] = useState(1);
  const [customNotes, setCustomNotes] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>('furniture');
  const toast = useToast();

  function setQty(key: ItemKey, qty: number) {
    const clamped = Math.max(0, Math.min(999, qty | 0));
    const next = { ...value, [key]: clamped };
    if (clamped === 0) delete (next as any)[key];
    const was = value[key] ?? 0;
    onChange(next);
    if (onChangedKeys) onChangedKeys([key]);
    setRecent(prev => {
      const filtered = prev.filter(k => k !== key);
      return clamped > 0 ? [key, ...filtered].slice(0, 10) : filtered;
    });
    if (was === 0 && clamped > 0) {
      setNewlyAdded(prev => new Set(prev).add(key));
      setTimeout(() => {
        setNewlyAdded(prev => { const n = new Set(prev); n.delete(key); return n; });
      }, 900);
    }
  }

  function inc(key: ItemKey) { setQty(key, (value[key] ?? 0) + 1); }
  function dec(key: ItemKey) { setQty(key, (value[key] ?? 0) - 1); }

  const filteredByCategory: Record<CategoryKey, CatalogItem[]> = useMemo(() => {
    const q = query.trim().toLowerCase();
    const res: Record<CategoryKey, CatalogItem[]> = {
      furniture: [], appliances: [], electronics: [], outdoor: [], sports: [], boxes: [], misc: []
    };
    for (const cat of CATEGORIES) {
      const items = itemsByCategory(cat);
      res[cat] = q
        ? items.filter(i => i.label.toLowerCase().includes(q) || i.key.includes(q as any))
        : items;
    }
    return res;
  }, [query]);

  return (
    <Box>
      <Box position="sticky" top={0} zIndex={1} bg="bg.surface" p={2} borderRadius="lg" boxShadow="xs" mb={3}>
        <InputGroup>
          <InputLeftElement pointerEvents="none">🔎</InputLeftElement>
          <Input placeholder="Search items..." value={query} onChange={e=>setQuery(e.target.value)} />
        </InputGroup>
        {recent.length > 0 && (
          <HStack spacing={2} mt={2} overflowX="auto">
            <Text fontSize="sm" color="text.muted">Recently used:</Text>
            {recent.map(k => (
              <Badge key={k} colorScheme="orange">{k.replace(/_/g,' ')}</Badge>
            ))}
          </HStack>
        )}
      </Box>

      <Box position="relative" zIndex="docked">
        {/* Fixed iOS-compatible category strip */}
        <Box position="relative">
          <HStack
            id="item-category-strip"
            overflowX="auto"
            whiteSpace="nowrap"
            align="center"
            gap="12px"
            px="8px"
            py="8px"
            position="relative"
            zIndex={0}
            sx={{
              contain: 'layout paint',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {CATEGORIES.map(cat => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "solid" : "ghost"}
                colorScheme="orange"
                minW="max-content"
                h="40px"
                px="12px"
                overflow="hidden"
                whiteSpace="nowrap"
                textOverflow="ellipsis"
                letterSpacing="normal"
                lineHeight="1.2"
                onClick={() => setSelectedCategory(cat)}
                sx={{
                  WebkitFontSmoothing: 'antialiased',
                  backfaceVisibility: 'hidden',
                }}
              >
                <HStack spacing={2}>
                  <span role="img" aria-label={`${CATEGORY_META[cat].label} icon`}>{CATEGORY_META[cat].icon}</span>
                  <span>{CATEGORY_META[cat].label}</span>
                </HStack>
              </Button>
            ))}
          </HStack>
          
          {/* Right fade mask - confine height to tab bar only */}
          <Box
            position="absolute"
            right="0"
            top="0"
            h="40px"
            w="24px"
            pointerEvents="none"
            zIndex={1}
            bgGradient="linear(to-l, rgba(11,18,32,.92), rgba(11,18,32,0))"
            display={{ base: 'none', md: 'block' }}
          />
        </Box>

        {/* Content panels */}
        <Box mt={3}>
          <Box position="relative">
            <Box position="absolute" inset={0} pointerEvents="none" opacity={0.35} filter="blur(32px)"
              style={{ background: `radial-gradient(120px 120px at 20% 10%, ${CATEGORY_META[selectedCategory].color}, transparent 70%)` }} />
          </Box>
          <MotionBox initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .2 }}>
            <SimpleGrid columns={{ base: 2, sm: 3, md: 4 }} spacing={3}>
              {filteredByCategory[selectedCategory].map(item => (
                <ItemCard
                  key={item.key}
                  name={item.key}
                  label={item.label}
                  imageSrc={item.image}
                  tooltip={item.tooltip}
                  quantity={value[item.key] ?? 0}
                  onIncrement={() => inc(item.key)}
                  onDecrement={() => dec(item.key)}
                  onSelect={() => inc(item.key)}
                  isNewlyAdded={newlyAdded.has(item.key)}
                  highlight={query}
                />
              ))}
              {/* Custom item card */}
              {selectedCategory === 'misc' && (
                <ItemCard
                  key="custom"
                  name="custom"
                  label="Add Custom Item"
                  imageSrc="/items/misc/add_custom.svg"
                  tooltip="Upload an image, set name and quantity"
                  quantity={0}
                  onIncrement={()=>setCustomOpen(true)}
                  onDecrement={()=>{}}
                  onSelect={()=>setCustomOpen(true)}
                />
              )}
            </SimpleGrid>
          </MotionBox>
        </Box>
      </Box>

      <Modal isOpen={isCustomOpen} onClose={()=>setCustomOpen(false)} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Custom Item</ModalHeader>
          <ModalBody>
            <Box display="grid" gap={3}>
              <Input placeholder="Name" value={customName} onChange={e=>setCustomName(e.target.value)} />
              <Input type="number" min={1} value={customQty} onChange={e=>setCustomQty(Math.max(1, Number(e.target.value||'1')))} />
              <Input placeholder="Notes (optional)" value={customNotes} onChange={e=>setCustomNotes(e.target.value)} />
            </Box>
          </ModalBody>
          <ModalFooter>
            <HStack>
              <Button variant="ghost" onClick={()=>setCustomOpen(false)}>Cancel</Button>
              <Button onClick={()=>{
                if (!customName.trim()) { toast({ status:'warning', title:'Enter a name' }); return; }
                // Map all custom items under 'custom' key, accumulate count
                const next = { ...value } as ItemsGridValue;
                next['custom' as ItemKey] = (next['custom' as ItemKey] ?? 0) + customQty;
                onChange(next);
                if (onChangedKeys) onChangedKeys(['custom' as ItemKey]);
                setRecent(prev => ['custom' as ItemKey, ...prev.filter(k=>k!=='custom')].slice(0,10));
                setCustomOpen(false);
                setCustomName(''); setCustomQty(1); setCustomNotes('');
              }}>Add</Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}


