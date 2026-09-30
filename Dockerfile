FROM node:24-alpine

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@12.4.1 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

ARG NEXT_PUBLIC_AUTHUSER_URL=http://localhost:3001
ARG NEXT_PUBLIC_GAME_URL=http://localhost:3002
ENV NEXT_PUBLIC_AUTHUSER_URL=$NEXT_PUBLIC_AUTHUSER_URL
ENV NEXT_PUBLIC_GAME_URL=$NEXT_PUBLIC_GAME_URL
ENV NODE_ENV=production

RUN pnpm build

RUN chown -R node:node /app
USER node

EXPOSE 3000
CMD ["pnpm", "start"]
