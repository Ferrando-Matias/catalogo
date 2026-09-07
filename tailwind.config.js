/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./admin.html", "./js/**/*.js"],
  theme: {
    extend: {
      colors: {
        // Yeso crudo: los fondos y superficies
        yeso: {
          50: "#FCF9F4",
          100: "#F7F1E7",
          200: "#EFE4D4",
          300: "#E3D2BB",
        },
        // Camel: el corazón de la marca
        camel: {
          300: "#D7B98F",
          400: "#C6A175",
          500: "#B4885C",
          600: "#9C7048",
        },
        // Tierra: textos y superficies profundas
        tierra: {
          600: "#7A5B3D",
          700: "#5E452E",
          800: "#42311F",
          900: "#2E2116",
        },
        // Terracota: acento cálido (precios, detalles)
        terracota: {
          400: "#CE8C68",
          500: "#B87351",
          600: "#9E5C3C",
        },
      },
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        sans: ["Outfit", "system-ui", "-apple-system", "sans-serif"],
      },
      boxShadow: {
        // Luz natural de mañana: sombra cálida, difusa, sin negro
        pieza: "0 18px 40px -18px rgba(94, 69, 46, 0.45), 0 4px 12px -6px rgba(94, 69, 46, 0.18)",
        "pieza-sm": "0 8px 20px -10px rgba(94, 69, 46, 0.35)",
        sello: "0 6px 0 -1px rgba(94, 69, 46, 0.22)",
      },
      borderRadius: {
        // Arco de hornacina: la forma firma del catálogo
        arco: "9999px 9999px 1.75rem 1.75rem",
        organico: "1.9rem 1.1rem 1.9rem 1.1rem",
        "organico-alt": "1.1rem 1.9rem 1.1rem 1.9rem",
      },
      keyframes: {
        sello: {
          "0%": { transform: "scale(1)" },
          "45%": { transform: "scale(0.94)" },
          "100%": { transform: "scale(1)" },
        },
        surgir: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        sello: "sello 260ms ease-out",
        surgir: "surgir 320ms ease-out both",
      },
    },
  },
  plugins: [],
};
