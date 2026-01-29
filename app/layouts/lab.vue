<template>
  <div class="min-h-screen pt-[61px]">
    <SiteHeader />
    <div class="flex">
      <LabNav />
      <main class="ml-64 flex-1">
        <slot />
      </main>
    </div>
  </div>
</template>
