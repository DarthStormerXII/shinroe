export type DesignStyle = 'minimal' | 'glassmorphism' | 'neumorphism' | 'cyberpunk' | 'material'

export interface ThemeColors {
  primary: string
  secondary: string
  background: string
  foreground: string
  card: string
  cardForeground: string
  border: string
  accent: string
  muted: string
  mutedForeground: string
  popover: string
  popoverForeground: string
  destructive: string
  destructiveForeground: string
  input: string
  ring: string
}

export interface StyleConfig {
  name: string
  description: string
  light: {
    colors: ThemeColors
  }
  dark: {
    colors: ThemeColors
  }
  button: {
    base: string
    hover: string
    active: string
  }
  card: {
    base: string
  }
  effects?: {
    blur?: string
    shadow?: string
  }
  fonts: {
    import: string
    heading: string
    body: string
    mono: string
  }
}

export const designStyles: Record<DesignStyle, StyleConfig> = {
  minimal: {
    name: 'Minimal',
    description: 'Clean and simple design with focus on content',
    light: {
      colors: {
        primary: '222.2 47.4% 11.2%',
        secondary: '210 40% 96.1%',
        background: '0 0% 98%',
        foreground: '222.2 84% 4.9%',
        card: '0 0% 100%',
        cardForeground: '222.2 84% 4.9%',
        border: '214.3 31.8% 91.4%',
        accent: '210 40% 96.1%',
        muted: '210 40% 96.1%',
        mutedForeground: '215.4 16.3% 46.9%',
        popover: '0 0% 100%',
        popoverForeground: '222.2 84% 4.9%',
        destructive: '0 84.2% 60.2%',
        destructiveForeground: '210 40% 98%',
        input: '214.3 31.8% 91.4%',
        ring: '222.2 84% 4.9%'
      }
    },
    dark: {
      colors: {
        primary: '210 40% 98%',
        secondary: '217.2 32.6% 17.5%',
        background: '222.2 47% 11%',
        foreground: '210 40% 98%',
        card: '217.2 32.6% 17.5%',
        cardForeground: '210 40% 98%',
        border: '217.2 32.6% 25%',
        accent: '217.2 32.6% 17.5%',
        muted: '217.2 32.6% 17.5%',
        mutedForeground: '215 20.2% 65.1%',
        popover: '217.2 32.6% 17.5%',
        popoverForeground: '210 40% 98%',
        destructive: '0 62.8% 30.6%',
        destructiveForeground: '210 40% 98%',
        input: '217.2 32.6% 17.5%',
        ring: '212.7 26.8% 83.9%'
      }
    },
    button: {
      base: 'bg-primary text-primary-foreground rounded-md px-4 py-2 font-medium transition-all',
      hover: 'hover:bg-primary/90',
      active: 'active:scale-95'
    },
    card: {
      base: 'bg-card text-card-foreground rounded-lg border border-border p-6'
    },
    fonts: {
      import: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap',
      heading: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      body: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      mono: '"JetBrains Mono", ui-monospace, monospace'
    }
  },
  glassmorphism: {
    name: 'Glassmorphism',
    description: 'Modern glass-like effects with transparency and blur',
    light: {
      colors: {
        primary: '222.2 47.4% 11.2%',
        secondary: '210 40% 96.1%',
        background: '210 30% 97%',
        foreground: '222.2 84% 4.9%',
        card: '0 0% 100%',
        cardForeground: '222.2 84% 4.9%',
        border: '214.3 31.8% 91.4%',
        accent: '210 40% 90%',
        muted: '210 40% 96.1%',
        mutedForeground: '215.4 16.3% 46.9%',
        popover: '0 0% 100%',
        popoverForeground: '222.2 84% 4.9%',
        destructive: '0 84.2% 60.2%',
        destructiveForeground: '210 40% 98%',
        input: '214.3 31.8% 91.4%',
        ring: '217.5 87.3% 54.9%'
      }
    },
    dark: {
      colors: {
        primary: '217.5 87.3% 54.9%',
        secondary: '217.2 32.6% 17.5%',
        background: '222.2 47% 8%',
        foreground: '210 40% 98%',
        card: '217.2 32.6% 14%',
        cardForeground: '210 40% 98%',
        border: '217.2 32.6% 20%',
        accent: '217.2 32.6% 20%',
        muted: '217.2 32.6% 17.5%',
        mutedForeground: '215 20.2% 65.1%',
        popover: '217.2 32.6% 14%',
        popoverForeground: '210 40% 98%',
        destructive: '0 62.8% 30.6%',
        destructiveForeground: '210 40% 98%',
        input: '217.2 32.6% 17.5%',
        ring: '217.5 87.3% 54.9%'
      }
    },
    button: {
      base: 'bg-white/10 dark:bg-white/5 backdrop-blur-md text-foreground rounded-xl px-6 py-3 font-medium border border-white/20 dark:border-white/10 transition-all',
      hover: 'hover:bg-white/20 dark:hover:bg-white/10 hover:border-white/30 dark:hover:border-white/20',
      active: 'active:scale-95'
    },
    card: {
      base: 'bg-white/30 dark:bg-white/5 text-card-foreground backdrop-blur-md rounded-2xl border border-white/20 dark:border-white/10 p-6'
    },
    effects: {
      blur: 'backdrop-blur-md',
      shadow: 'shadow-xl'
    },
    fonts: {
      import: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap',
      heading: '"Space Grotesk", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      body: '"Space Grotesk", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      mono: '"Space Mono", ui-monospace, monospace'
    }
  },
  neumorphism: {
    name: 'Neumorphism',
    description: 'Soft UI design with subtle shadows and depth',
    light: {
      colors: {
        primary: '243 80% 62%',
        secondary: '271 91% 65%',
        background: '223 14% 95%',
        foreground: '222 47% 11%',
        card: '223 14% 97%',
        cardForeground: '222 47% 11%',
        border: '223 14% 90%',
        accent: '243 80% 62%',
        muted: '210 40% 96.1%',
        mutedForeground: '215.4 16.3% 46.9%',
        popover: '223 14% 97%',
        popoverForeground: '222 47% 11%',
        destructive: '0 84.2% 60.2%',
        destructiveForeground: '210 40% 98%',
        input: '223 14% 90%',
        ring: '243 80% 62%'
      }
    },
    dark: {
      colors: {
        primary: '243 80% 62%',
        secondary: '271 91% 65%',
        background: '222 47% 11%',
        foreground: '210 40% 98%',
        card: '222 47% 15%',
        cardForeground: '210 40% 98%',
        border: '222 47% 20%',
        accent: '243 80% 62%',
        muted: '217.2 32.6% 17.5%',
        mutedForeground: '215 20.2% 65.1%',
        popover: '222 47% 15%',
        popoverForeground: '210 40% 98%',
        destructive: '0 62.8% 30.6%',
        destructiveForeground: '210 40% 98%',
        input: '222 47% 20%',
        ring: '243 80% 62%'
      }
    },
    button: {
      base: 'bg-card text-foreground rounded-2xl px-6 py-3 font-medium transition-all shadow-[6px_6px_12px_hsl(var(--muted)/0.4),-6px_-6px_12px_hsl(var(--background))] dark:shadow-[6px_6px_12px_rgba(0,0,0,0.4),-6px_-6px_12px_rgba(255,255,255,0.05)]',
      hover: 'hover:shadow-[4px_4px_8px_hsl(var(--muted)/0.4),-4px_-4px_8px_hsl(var(--background))] dark:hover:shadow-[4px_4px_8px_rgba(0,0,0,0.4),-4px_-4px_8px_rgba(255,255,255,0.05)]',
      active: 'active:shadow-[inset_2px_2px_4px_hsl(var(--muted)/0.4),inset_-2px_-2px_4px_hsl(var(--background))] dark:active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-2px_-2px_4px_rgba(255,255,255,0.05)]'
    },
    card: {
      base: 'bg-card text-card-foreground rounded-3xl p-8 shadow-[8px_8px_16px_hsl(var(--muted)/0.4),-8px_-8px_16px_hsl(var(--background))] dark:shadow-[8px_8px_16px_rgba(0,0,0,0.4),-8px_-8px_16px_rgba(255,255,255,0.05)]'
    },
    fonts: {
      import: 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&family=Fira+Code:wght@400;500&display=swap',
      heading: '"Nunito", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      body: '"Nunito", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      mono: '"Fira Code", ui-monospace, monospace'
    }
  },
  cyberpunk: {
    name: 'Cyberpunk',
    description: 'Futuristic neon-themed design with glowing effects',
    light: {
      colors: {
        primary: '153 87% 49%',
        secondary: '330 100% 50%',
        background: '0 0% 95%',
        foreground: '0 0% 10%',
        card: '0 0% 98%',
        cardForeground: '0 0% 10%',
        border: '153 87% 49%',
        accent: '48 100% 50%',
        muted: '0 0% 90%',
        mutedForeground: '0 0% 35%',
        popover: '0 0% 98%',
        popoverForeground: '0 0% 10%',
        destructive: '0 84.2% 60.2%',
        destructiveForeground: '0 0% 100%',
        input: '0 0% 90%',
        ring: '153 87% 49%'
      }
    },
    dark: {
      colors: {
        primary: '153 100% 50%',
        secondary: '330 100% 50%',
        background: '0 0% 7%',
        foreground: '0 0% 100%',
        card: '0 0% 11%',
        cardForeground: '0 0% 100%',
        border: '153 100% 50%',
        accent: '48 100% 50%',
        muted: '0 0% 15%',
        mutedForeground: '0 0% 60%',
        popover: '0 0% 11%',
        popoverForeground: '0 0% 100%',
        destructive: '0 62.8% 30.6%',
        destructiveForeground: '0 0% 100%',
        input: '0 0% 15%',
        ring: '153 100% 50%'
      }
    },
    button: {
      base: 'bg-transparent text-primary rounded-none px-6 py-3 font-bold uppercase tracking-wider border-2 border-primary transition-all relative overflow-hidden',
      hover: 'hover:text-white hover:bg-primary hover:shadow-[0_0_20px_hsl(var(--primary))]',
      active: 'active:scale-95'
    },
    card: {
      base: 'bg-card text-card-foreground rounded-sm border-2 border-primary p-6 relative overflow-hidden shadow-[0_0_30px_hsl(var(--primary)/0.3)]'
    },
    effects: {
      shadow: 'shadow-[0_0_30px_hsl(var(--primary)/0.3)]'
    },
    fonts: {
      import: 'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Share+Tech+Mono&display=swap',
      heading: '"Orbitron", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      body: '"Orbitron", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      mono: '"Share Tech Mono", ui-monospace, monospace'
    }
  },
  material: {
    name: 'Material Design',
    description: 'Google Material Design inspired components',
    light: {
      colors: {
        primary: '212 92% 45%',
        secondary: '346 100% 44%',
        background: '0 0% 98%',
        foreground: '0 0% 13%',
        card: '0 0% 100%',
        cardForeground: '0 0% 13%',
        border: '0 0% 88%',
        accent: '282 68% 42%',
        muted: '0 0% 96%',
        mutedForeground: '0 0% 25%',
        popover: '0 0% 100%',
        popoverForeground: '0 0% 13%',
        destructive: '0 84.2% 60.2%',
        destructiveForeground: '0 0% 100%',
        input: '0 0% 88%',
        ring: '212 92% 45%'
      }
    },
    dark: {
      colors: {
        primary: '212 92% 60%',
        secondary: '346 100% 65%',
        background: '0 0% 11%',
        foreground: '0 0% 100%',
        card: '0 0% 15%',
        cardForeground: '0 0% 100%',
        border: '0 0% 25%',
        accent: '282 68% 60%',
        muted: '0 0% 20%',
        mutedForeground: '0 0% 60%',
        popover: '0 0% 15%',
        popoverForeground: '0 0% 100%',
        destructive: '0 62.8% 30.6%',
        destructiveForeground: '0 0% 100%',
        input: '0 0% 25%',
        ring: '212 92% 60%'
      }
    },
    button: {
      base: 'bg-primary text-primary-foreground rounded px-4 py-2 font-medium uppercase tracking-wide transition-all shadow-md',
      hover: 'hover:bg-primary/90 hover:shadow-lg',
      active: 'active:shadow-sm'
    },
    card: {
      base: 'bg-card text-card-foreground rounded-md shadow-md p-6 transition-shadow hover:shadow-lg'
    },
    effects: {
      shadow: 'shadow-md'
    },
    fonts: {
      import: 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&family=Roboto+Mono:wght@400;500&display=swap',
      heading: '"Roboto", -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
      body: '"Roboto", -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
      mono: '"Roboto Mono", ui-monospace, monospace'
    }
  }
}