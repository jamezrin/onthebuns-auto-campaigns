# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1 as base
WORKDIR /usr/src/app

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lockb /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

# install with --production (exclude devDependencies)
RUN mkdir -p /temp/prod
COPY package.json bun.lockb /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

# copy node_modules from temp directory
# then copy all (non-ignored) project files into the image
FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

# [optional] tests & build
ENV NODE_ENV=production
RUN bun test
RUN bun run build

# copy production binary to final image
FROM debian:bookworm-slim AS release
WORKDIR /app
RUN rm -rf /var/lib/apt/lists/*
RUN groupadd -r app && useradd --no-log-init -r -g app app
COPY --from=prerelease /usr/src/app/out/onthatass-auto-campaigns-bin /app/onthatass-auto-campaigns-bin

USER app
ENTRYPOINT [ "/app/onthatass-auto-campaigns-bin" ]