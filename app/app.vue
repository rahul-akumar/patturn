<template>
  <div class="min-h-screen bg-dark-900 text-white antialiased selection:bg-white selection:text-dark-900">
    <CustomCursor />
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<style>
html {
  background-color: #0a0a0a;
}

::selection {
  background: white;
  color: #0a0a0a;
}

* {
  cursor: none;
}
</style>
