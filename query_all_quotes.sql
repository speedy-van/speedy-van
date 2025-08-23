SELECT "hash", "totalIncVat", "subtotalExVat", "vatRate", "createdAt" 
FROM "QuoteSnapshot" 
ORDER BY "createdAt" DESC 
LIMIT 10;
