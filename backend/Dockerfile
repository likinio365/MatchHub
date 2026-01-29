# Χρήση της Node 25.2.1
FROM node:25.2.1-alpine

WORKDIR /app

# Αντιγραφή των package files πρώτα (για caching)
COPY package*.json ./

# Εγκατάσταση εξαρτήσεων
RUN npm install

# Αντιγραφή του υπόλοιπου κώδικα
COPY . .

EXPOSE 5000

# Εκκίνηση
CMD ["node", "server.js"]