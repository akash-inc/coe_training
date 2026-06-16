FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Vite inlines VITE_* values at build time, so they must be present here.
# Railway passes service variables to the build as ARGs.
ARG VITE_API_BASE_URL
ARG VITE_API_WS_HOST
ARG VITE_SENTRY_DSN
ARG VITE_SENTRY_ENVIRONMENT
ARG VITE_SENTRY_TRACES_SAMPLE_RATE
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_API_WS_HOST=$VITE_API_WS_HOST
ENV VITE_SENTRY_DSN=$VITE_SENTRY_DSN
ENV VITE_SENTRY_ENVIRONMENT=$VITE_SENTRY_ENVIRONMENT
ENV VITE_SENTRY_TRACES_SAMPLE_RATE=$VITE_SENTRY_TRACES_SAMPLE_RATE

RUN npm run build

FROM nginx:alpine AS production

# The official nginx entrypoint substitutes env vars (e.g. $PORT) into
# templates/*.template at startup, so Railway's injected PORT is honored.
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html

ENV PORT=8080
EXPOSE 8080
