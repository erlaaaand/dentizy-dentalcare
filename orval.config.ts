import { defineConfig } from 'orval';

export default defineConfig({
  dentizy: {
    input: {
      target: './swagger.json',
    },
    output: {
      // 1. Aktifkan split agar output menjadi banyak file di dalam folder
      mode: 'tags-split',

      // 2. Folder khusus untuk Hooks & Logic (selebihnya)
      target: 'src/core/api/generated',

      // 3. Folder khusus untuk DTO/Interfaces
      schemas: 'src/core/api/model',

      client: 'react-query',
      prettier: false, // Matikan dulu untuk menghindari error formatting
      clean: true,

      override: {
        mutator: {
          path: './src/core/service/http/axiosInstance.ts',
          name: 'customInstance',
        },
      },
    },
  },
});