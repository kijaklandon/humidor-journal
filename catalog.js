// ============================================================
//  THE CIGAR VAULT
//  These cigars autofill when you log them, and they're the pool
//  that recommendations are picked from.
//
//  Each line is one cigar line (sizes don't get their own line):
//    b     = brand
//    n     = name / line
//    w     = wrapper:  Connecticut, Cameroon, Habano, Corojo, Sumatra, Rosado,
//                      Maduro, Broadleaf, San Andrés, Candela, Other
//    o     = country made:  Nicaragua, Dominican Republic, Honduras, Cuba, Mexico, USA, Other
//    s     = strength: 1 Mild, 2 Mild-Medium, 3 Medium, 4 Medium-Full, 5 Full
//    notes = typical flavors, picked from:
//            Cedar, Leather, Cocoa, Coffee, Pepper, Spice, Cream, Nuts, Earth,
//            Sweet, Wood, Toast, Honey, Citrus, Floral, Fruit
//
//  Optional details:
//    bi       = binder (where it's from)
//    f        = filler (where it's from)
//    fac      = factory
//    status   = 'limited' (hard to find / special release) or 'discontinued'
//    checked  = true when the blend (wrapper/binder/filler) was confirmed
//               against published specs. Flavor and strength are always
//               general consensus, not lab facts.
//    verified = true once YOU have confirmed the entry from experience
//
//  If something looks wrong, fix it here (or tell Claude).
// ============================================================

const CATALOG = [
  // ----- Alec Bradley (Honduras) -----
  { b: 'Alec Bradley', n: 'Prensado', w: 'Corojo', bi: 'Nicaragua', f: 'Honduras, Nicaragua', o: 'Honduras', s: 4, notes: ['Cocoa', 'Earth', 'Spice', 'Cedar'], checked: true },
  { b: 'Alec Bradley', n: 'Black Market', w: 'Habano', bi: 'Indonesia (Sumatra)', f: 'Honduras, Panama', o: 'Honduras', s: 4, notes: ['Earth', 'Spice', 'Cocoa', 'Leather'], checked: true },
  { b: 'Alec Bradley', n: 'American Classic', w: 'Connecticut', bi: 'Honduras, Nicaragua', f: 'Honduras, Nicaragua', o: 'Honduras', s: 2, notes: ['Cream', 'Cedar', 'Nuts', 'Toast'], checked: true },
  { b: 'Alec Bradley', n: 'Tempus', w: 'Habano', bi: 'Honduras', f: 'Honduras, Nicaragua', o: 'Honduras', s: 4, notes: ['Cedar', 'Spice', 'Cocoa', 'Sweet'] },
  { b: 'Alec Bradley', n: 'Coyol', w: 'Habano', bi: 'Honduras, Nicaragua', f: 'Honduras, Nicaragua', o: 'Honduras', s: 4, notes: ['Pepper', 'Earth', 'Leather', 'Spice'], checked: true },

  // ----- Arturo Fuente (Tabacalera A. Fuente, Dominican Republic) -----
  { b: 'Arturo Fuente', n: 'Hemingway Short Story', w: 'Cameroon', bi: 'Dominican Republic', f: 'Dominican Republic', o: 'Dominican Republic', fac: 'Tabacalera A. Fuente', s: 2, notes: ['Cedar', 'Cream', 'Sweet', 'Nuts'], checked: true },
  { b: 'Arturo Fuente', n: 'Hemingway Signature', w: 'Cameroon', bi: 'Dominican Republic', f: 'Dominican Republic', o: 'Dominican Republic', fac: 'Tabacalera A. Fuente', s: 2, notes: ['Cedar', 'Sweet', 'Nuts', 'Spice'], checked: true },
  { b: 'Arturo Fuente', n: 'Hemingway Maduro', w: 'Broadleaf', bi: 'Dominican Republic', f: 'Dominican Republic', o: 'Dominican Republic', fac: 'Tabacalera A. Fuente', s: 3, notes: ['Cocoa', 'Sweet', 'Cedar', 'Earth'], checked: true },
  { b: 'Arturo Fuente', n: 'Don Carlos', w: 'Cameroon', bi: 'Dominican Republic', f: 'Dominican Republic', o: 'Dominican Republic', fac: 'Tabacalera A. Fuente', s: 3, notes: ['Cedar', 'Nuts', 'Spice', 'Leather'], checked: true },
  { b: 'Arturo Fuente', n: 'Gran Reserva 8-5-8', w: 'Cameroon', bi: 'Dominican Republic', f: 'Dominican Republic', o: 'Dominican Republic', fac: 'Tabacalera A. Fuente', s: 3, notes: ['Cedar', 'Wood', 'Sweet', 'Spice'], checked: true },
  { b: 'Arturo Fuente', n: '8-5-8 Rosado Sun Grown', w: 'Rosado', bi: 'Dominican Republic', f: 'Dominican Republic', o: 'Dominican Republic', fac: 'Tabacalera A. Fuente', s: 3, notes: ['Spice', 'Cedar', 'Sweet', 'Leather'], checked: true },
  { b: 'Arturo Fuente', n: 'Rosado Sungrown (Magnum R)', w: 'Rosado', bi: 'Dominican Republic', f: 'Dominican Republic', o: 'Dominican Republic', fac: 'Tabacalera A. Fuente', s: 3, notes: ['Cedar', 'Spice', 'Sweet', 'Leather'] },
  { b: 'Arturo Fuente', n: 'Añejo', w: 'Broadleaf', bi: 'Dominican Republic', f: 'Dominican Republic', o: 'Dominican Republic', fac: 'Tabacalera A. Fuente', s: 4, notes: ['Cocoa', 'Leather', 'Sweet', 'Spice'], status: 'limited', checked: true },
  { b: 'Arturo Fuente', n: 'Chateau Fuente', w: 'Connecticut', bi: 'Dominican Republic', f: 'Dominican Republic', o: 'Dominican Republic', fac: 'Tabacalera A. Fuente', s: 2, notes: ['Cedar', 'Cream', 'Nuts', 'Wood'] },
  { b: 'Arturo Fuente', n: 'Chateau Fuente Maduro', w: 'Broadleaf', bi: 'Dominican Republic', f: 'Dominican Republic', o: 'Dominican Republic', fac: 'Tabacalera A. Fuente', s: 3, notes: ['Cocoa', 'Sweet', 'Earth', 'Cedar'], checked: true },
  { b: 'Arturo Fuente', n: 'Casa Cuba', w: 'Habano', bi: 'Dominican Republic', f: 'Dominican Republic', o: 'Dominican Republic', fac: 'Tabacalera A. Fuente', s: 3, notes: ['Cedar', 'Nuts', 'Cream', 'Spice'] },
  { b: 'Arturo Fuente', n: 'Casa Fuente', w: 'Cameroon', bi: 'Dominican Republic', f: 'Dominican Republic', o: 'Dominican Republic', fac: 'Tabacalera A. Fuente', s: 4, notes: ['Cedar', 'Leather', 'Spice', 'Sweet'], status: 'limited', checked: true },
  { b: 'Arturo Fuente', n: 'Opus X', w: 'Rosado', bi: 'Dominican Republic', f: 'Dominican Republic', o: 'Dominican Republic', fac: 'Tabacalera A. Fuente', s: 5, notes: ['Spice', 'Leather', 'Cedar', 'Pepper'], status: 'limited', checked: true },

  // ----- Ashton (made by Tabacalera A. Fuente, Dominican Republic) -----
  { b: 'Ashton', n: 'Classic', w: 'Connecticut', bi: 'Dominican Republic', f: 'Dominican Republic', o: 'Dominican Republic', fac: 'Tabacalera A. Fuente', s: 1, notes: ['Cream', 'Cedar', 'Nuts', 'Toast'], checked: true },
  { b: 'Ashton', n: 'Cabinet Selection', w: 'Connecticut', bi: 'Dominican Republic', f: 'Dominican Republic', o: 'Dominican Republic', fac: 'Tabacalera A. Fuente', s: 2, notes: ['Cedar', 'Cream', 'Honey', 'Nuts'], checked: true },
  { b: 'Ashton', n: 'Aged Maduro', w: 'Broadleaf', bi: 'Dominican Republic', f: 'Dominican Republic', o: 'Dominican Republic', fac: 'Tabacalera A. Fuente', s: 3, notes: ['Cocoa', 'Sweet', 'Coffee', 'Cedar'], checked: true },
  { b: 'Ashton', n: 'VSG', w: 'Sumatra', bi: 'Dominican Republic', f: 'Dominican Republic', o: 'Dominican Republic', fac: 'Tabacalera A. Fuente', s: 4, notes: ['Leather', 'Spice', 'Cedar', 'Earth'], checked: true },
  { b: 'Ashton', n: 'ESG', w: 'Sumatra', bi: 'Dominican Republic', f: 'Dominican Republic', o: 'Dominican Republic', fac: 'Tabacalera A. Fuente', s: 4, notes: ['Leather', 'Spice', 'Cedar', 'Sweet'], status: 'limited', checked: true },
  { b: 'Ashton', n: 'Symmetry', w: 'Habano', bi: 'Dominican Republic, Nicaragua', f: 'Dominican Republic, Nicaragua', o: 'Dominican Republic', fac: 'Tabacalera A. Fuente', s: 4, notes: ['Cedar', 'Spice', 'Cocoa', 'Sweet'], checked: true },

  // ----- AVO -----
  { b: 'AVO', n: 'Classic', w: 'Connecticut', o: 'Dominican Republic', s: 2, notes: ['Cream', 'Cedar', 'Nuts', 'Floral'] },

  // ----- AJ Fernandez (Tabacalera AJ Fernandez, Estelí, Nicaragua) -----
  { b: 'AJ Fernandez', n: 'New World', w: 'Habano', bi: 'Nicaragua', f: 'Nicaragua', o: 'Nicaragua', fac: 'Tabacalera AJ Fernandez', s: 4, notes: ['Pepper', 'Earth', 'Cocoa', 'Leather'] },
  { b: 'AJ Fernandez', n: 'New World Connecticut', w: 'Connecticut', bi: 'Mexico', f: 'Nicaragua, Brazil', o: 'Nicaragua', fac: 'Tabacalera AJ Fernandez', s: 2, notes: ['Cream', 'Cedar', 'Nuts', 'Pepper'], checked: true },
  { b: 'AJ Fernandez', n: 'New World Cameroon', w: 'Cameroon', bi: 'Nicaragua', f: 'Nicaragua', o: 'Nicaragua', fac: 'Tabacalera AJ Fernandez', s: 3, notes: ['Cedar', 'Sweet', 'Spice', 'Wood'], checked: true },
  { b: 'AJ Fernandez', n: 'San Lotano Habano', w: 'Habano', bi: 'Nicaragua', f: 'Nicaragua, Honduras', o: 'Nicaragua', fac: 'Tabacalera AJ Fernandez', s: 4, notes: ['Spice', 'Cedar', 'Leather', 'Earth'], checked: true },
  { b: 'AJ Fernandez', n: 'San Lotano Maduro', w: 'Broadleaf', o: 'Nicaragua', fac: 'Tabacalera AJ Fernandez', s: 4, notes: ['Cocoa', 'Coffee', 'Sweet', 'Earth'] },
  { b: 'AJ Fernandez', n: 'San Lotano Connecticut', w: 'Connecticut', o: 'Nicaragua', fac: 'Tabacalera AJ Fernandez', s: 2, notes: ['Cream', 'Nuts', 'Cedar', 'Toast'] },
  { b: 'AJ Fernandez', n: 'Bellas Artes', w: 'Other', bi: 'Nicaragua', f: 'Brazil, Honduras, Nicaragua', o: 'Nicaragua', fac: 'Tabacalera AJ Fernandez', s: 4, notes: ['Spice', 'Sweet', 'Leather', 'Cedar'], checked: true },
  { b: 'AJ Fernandez', n: 'Bellas Artes Maduro', w: 'Maduro', o: 'Nicaragua', fac: 'Tabacalera AJ Fernandez', s: 4, notes: ['Cocoa', 'Coffee', 'Sweet', 'Pepper'] },
  { b: 'AJ Fernandez', n: 'Enclave', w: 'Habano', o: 'Nicaragua', fac: 'Tabacalera AJ Fernandez', s: 3, notes: ['Cedar', 'Sweet', 'Spice', 'Nuts'] },
  { b: 'AJ Fernandez', n: 'Last Call', w: 'Habano', o: 'Nicaragua', fac: 'Tabacalera AJ Fernandez', s: 4, notes: ['Pepper', 'Earth', 'Cocoa', 'Leather'] },

  // ----- Brick House -----
  { b: 'Brick House', n: 'Classic', w: 'Habano', o: 'Nicaragua', s: 3, notes: ['Nuts', 'Cedar', 'Sweet', 'Leather'] },

  // ----- CAO -----
  { b: 'CAO', n: 'Flathead', w: 'Broadleaf', o: 'Nicaragua', s: 4, notes: ['Cocoa', 'Coffee', 'Sweet', 'Earth'] },

  // ----- Camacho (Honduras) -----
  { b: 'Camacho', n: 'Corojo', w: 'Corojo', o: 'Honduras', s: 4, notes: ['Pepper', 'Spice', 'Earth', 'Leather'] },
  { b: 'Camacho', n: 'Connecticut', w: 'Connecticut', bi: 'Honduras', f: 'Honduras, Dominican Republic', o: 'Honduras', s: 2, notes: ['Cream', 'Cedar', 'Nuts', 'Toast'] },
  { b: 'Camacho', n: 'Ecuador', w: 'Habano', bi: 'Brazil', o: 'Honduras', s: 4, notes: ['Cedar', 'Spice', 'Sweet', 'Earth'], checked: true },
  { b: 'Camacho', n: 'Criollo', w: 'Corojo', bi: 'Honduras', f: 'Honduras', o: 'Honduras', s: 4, notes: ['Spice', 'Cedar', 'Earth', 'Sweet'] },
  { b: 'Camacho', n: 'Triple Maduro', w: 'San Andrés', bi: 'Honduras', f: 'Honduras, Dominican Republic, Brazil', o: 'Honduras', s: 5, notes: ['Cocoa', 'Coffee', 'Earth', 'Leather'], checked: true },
  { b: 'Camacho', n: 'American Barrel-Aged', w: 'Broadleaf', bi: 'USA', f: 'USA, Honduras', o: 'Honduras', s: 4, notes: ['Sweet', 'Wood', 'Cocoa', 'Earth'], checked: true },

  // ----- Cohiba (Dominican) -----
  { b: 'Cohiba', n: 'Red Dot', w: 'Cameroon', o: 'Dominican Republic', s: 3, notes: ['Cedar', 'Spice', 'Sweet', 'Nuts'] },

  // ----- Crowned Heads -----
  { b: 'Crowned Heads', n: 'Four Kicks', w: 'Sumatra', bi: 'Nicaragua', f: 'Dominican Republic, Nicaragua', o: 'Dominican Republic', fac: 'Tabacalera Alianza', s: 3, notes: ['Cedar', 'Sweet', 'Spice', 'Cream'], checked: true },
  { b: 'Crowned Heads', n: 'Jericho Hill', w: 'San Andrés', bi: 'Nicaragua', f: 'Nicaragua', o: 'Nicaragua', fac: 'My Father Cigars', s: 4, notes: ['Cocoa', 'Earth', 'Pepper', 'Sweet'], checked: true },
  { b: 'Crowned Heads', n: 'Mil Días', w: 'Habano', bi: 'Nicaragua', f: 'Costa Rica, Nicaragua', o: 'Nicaragua', fac: 'Tabacalera Pichardo', s: 3, notes: ['Cedar', 'Cream', 'Spice', 'Sweet'], checked: true },
  { b: 'Crowned Heads', n: 'Juárez', w: 'San Andrés', bi: 'Ecuador (Sumatra)', f: 'Dominican Republic, Nicaragua', o: 'Nicaragua', fac: 'Tabacalera Pichardo', s: 4, notes: ['Cocoa', 'Earth', 'Pepper', 'Coffee'], checked: true },

  // ----- Davidoff -----
  { b: 'Davidoff', n: 'Signature 2000', w: 'Connecticut', o: 'Dominican Republic', s: 1, notes: ['Cream', 'Cedar', 'Nuts', 'Floral'] },
  { b: 'Davidoff', n: 'Grand Cru', w: 'Connecticut', o: 'Dominican Republic', s: 2, notes: ['Cedar', 'Cream', 'Nuts', 'Floral'] },
  { b: 'Davidoff', n: 'Millennium', w: 'Sumatra', o: 'Dominican Republic', s: 4, notes: ['Cedar', 'Spice', 'Leather', 'Cream'] },
  { b: 'Davidoff', n: 'Nicaragua', w: 'Habano', bi: 'Nicaragua', f: 'Nicaragua', o: 'Nicaragua', s: 3, notes: ['Cedar', 'Pepper', 'Sweet', 'Leather'], checked: true },
  { b: 'Davidoff', n: 'Nicaragua Box Pressed', w: 'Habano', bi: 'Nicaragua', f: 'Nicaragua', o: 'Nicaragua', s: 4, notes: ['Pepper', 'Cocoa', 'Leather', 'Sweet'], checked: true },
  { b: 'Davidoff', n: 'Yamasá', w: 'Other', bi: 'Dominican Republic', f: 'Dominican Republic, Nicaragua', o: 'Dominican Republic', s: 4, notes: ['Earth', 'Spice', 'Sweet', 'Leather'], checked: true },
  { b: 'Davidoff', n: 'Escurio', w: 'Habano', bi: 'Brazil', f: 'Brazil, Dominican Republic', o: 'Dominican Republic', s: 3, notes: ['Spice', 'Sweet', 'Earth', 'Cocoa'], checked: true },
  { b: 'Davidoff', n: 'Winston Churchill', w: 'Habano', bi: 'Mexico', f: 'Dominican Republic, Nicaragua', o: 'Dominican Republic', s: 3, notes: ['Cedar', 'Leather', 'Spice', 'Cream'], checked: true },
  { b: 'Davidoff', n: 'Winston Churchill The Late Hour', w: 'Habano', bi: 'Mexico', o: 'Dominican Republic', s: 4, notes: ['Cocoa', 'Leather', 'Spice', 'Coffee'], checked: true },

  // ----- Diamond Crown -----
  { b: 'Diamond Crown', n: 'Classic', w: 'Connecticut', o: 'Dominican Republic', s: 2, notes: ['Cream', 'Cedar', 'Nuts', 'Honey'] },

  // ----- Don Pepin Garcia (My Father Cigars, Estelí, Nicaragua) -----
  { b: 'Don Pepin Garcia', n: 'Blue Label (Original)', w: 'Corojo', bi: 'Nicaragua', f: 'Nicaragua', o: 'Nicaragua', fac: 'My Father Cigars', s: 5, notes: ['Pepper', 'Spice', 'Cedar', 'Earth'] },
  { b: 'Don Pepin Garcia', n: 'Cuban Classic (Black Label)', w: 'Habano', bi: 'Nicaragua', f: 'Nicaragua', o: 'Nicaragua', fac: 'My Father Cigars', s: 4, notes: ['Pepper', 'Cedar', 'Leather', 'Sweet'] },
  { b: 'Don Pepin Garcia', n: 'Green Label (Vegas Cubanas)', w: 'Corojo', bi: 'Nicaragua', f: 'Nicaragua', o: 'Nicaragua', fac: 'My Father Cigars', s: 4, notes: ['Spice', 'Cedar', 'Earth', 'Sweet'], checked: true },

  // ----- Drew Estate (La Gran Fabrica Drew Estate, Estelí, Nicaragua) -----
  { b: 'Drew Estate', n: 'Liga Privada No. 9', w: 'Broadleaf', bi: 'Brazil', f: 'Honduras, Nicaragua', o: 'Nicaragua', fac: 'La Gran Fabrica Drew Estate', s: 5, notes: ['Coffee', 'Cocoa', 'Earth', 'Leather'] },
  { b: 'Drew Estate', n: 'Liga Privada T52', w: 'Habano', bi: 'Brazil', f: 'Honduras, Nicaragua', o: 'Nicaragua', fac: 'La Gran Fabrica Drew Estate', s: 4, notes: ['Leather', 'Earth', 'Spice', 'Wood'] },
  { b: 'Drew Estate', n: 'Liga Privada Único Dirty Rat', w: 'Habano', bi: 'Brazil', f: 'Honduras, Nicaragua', o: 'Nicaragua', fac: 'La Gran Fabrica Drew Estate', s: 5, notes: ['Pepper', 'Leather', 'Earth', 'Cocoa'], status: 'limited', checked: true },
  { b: 'Drew Estate', n: 'Undercrown Maduro', w: 'San Andrés', bi: 'USA (Connecticut)', f: 'Nicaragua', o: 'Nicaragua', fac: 'La Gran Fabrica Drew Estate', s: 4, notes: ['Cocoa', 'Coffee', 'Earth', 'Sweet'] },
  { b: 'Drew Estate', n: 'Undercrown Shade', w: 'Connecticut', o: 'Nicaragua', fac: 'La Gran Fabrica Drew Estate', s: 2, notes: ['Cream', 'Nuts', 'Cedar', 'Honey'] },
  { b: 'Drew Estate', n: 'Undercrown Sun Grown', w: 'Sumatra', o: 'Nicaragua', fac: 'La Gran Fabrica Drew Estate', s: 4, notes: ['Spice', 'Cedar', 'Earth', 'Sweet'] },
  { b: 'Drew Estate', n: 'Herrera Estelí', w: 'Habano', bi: 'Honduras', f: 'Nicaragua', o: 'Nicaragua', fac: 'La Gran Fabrica Drew Estate', s: 3, notes: ['Cedar', 'Cream', 'Spice', 'Nuts'] },
  { b: 'Drew Estate', n: 'Herrera Estelí Norteño', w: 'San Andrés', o: 'Nicaragua', fac: 'La Gran Fabrica Drew Estate', s: 4, notes: ['Cocoa', 'Earth', 'Sweet', 'Pepper'] },
  { b: 'Drew Estate', n: 'Nica Rustica', w: 'Broadleaf', o: 'Nicaragua', fac: 'La Gran Fabrica Drew Estate', s: 4, notes: ['Earth', 'Cocoa', 'Pepper', 'Sweet'] },
  { b: 'Drew Estate', n: 'Florida Sun Grown', w: 'Other', o: 'Nicaragua', fac: 'La Gran Fabrica Drew Estate', s: 4, notes: ['Earth', 'Cedar', 'Spice', 'Sweet'] },
  { b: 'Drew Estate', n: 'Acid Kuba Kuba', w: 'Sumatra', o: 'Nicaragua', fac: 'La Gran Fabrica Drew Estate', s: 2, notes: ['Sweet', 'Floral', 'Spice', 'Wood'] },
  { b: 'Drew Estate', n: 'Isla del Sol', w: 'Connecticut', o: 'Nicaragua', fac: 'La Gran Fabrica Drew Estate', s: 1, notes: ['Coffee', 'Cream', 'Sweet', 'Nuts'] },
  { b: 'Java', n: 'Maduro', w: 'Maduro', o: 'Nicaragua', fac: 'La Gran Fabrica Drew Estate', s: 2, notes: ['Coffee', 'Cocoa', 'Sweet', 'Cream'] },

  // ----- E.P. Carrillo -----
  { b: 'E.P. Carrillo', n: 'Encore', w: 'Habano', o: 'Nicaragua', s: 4, notes: ['Cocoa', 'Spice', 'Cedar', 'Coffee'] },

  // ----- Foundation -----
  { b: 'Foundation', n: 'The Tabernacle', w: 'Broadleaf', o: 'Nicaragua', s: 4, notes: ['Cocoa', 'Earth', 'Sweet', 'Coffee'] },

  // ----- Illusione -----
  { b: 'Illusione', n: '~888~', w: 'Corojo', o: 'Nicaragua', s: 3, notes: ['Cedar', 'Spice', 'Sweet', 'Wood'] },

  // ----- Joya de Nicaragua -----
  { b: 'Joya de Nicaragua', n: 'Antaño 1970', w: 'Habano', o: 'Nicaragua', s: 5, notes: ['Pepper', 'Leather', 'Earth', 'Spice'] },

  // ----- La Aroma de Cuba -----
  { b: 'La Aroma de Cuba', n: 'Mi Amor', w: 'San Andrés', bi: 'Nicaragua', f: 'Nicaragua', o: 'Nicaragua', fac: 'My Father Cigars', s: 4, notes: ['Cocoa', 'Coffee', 'Sweet', 'Earth'] },

  // ----- La Flor Dominicana (Tabacalera La Flor, Dominican Republic) -----
  { b: 'La Flor Dominicana', n: 'Double Ligero', w: 'Sumatra', bi: 'Dominican Republic', f: 'Dominican Republic', o: 'Dominican Republic', fac: 'Tabacalera La Flor', s: 5, notes: ['Pepper', 'Leather', 'Earth', 'Spice'], checked: true },
  { b: 'La Flor Dominicana', n: 'Ligero', w: 'Sumatra', o: 'Dominican Republic', fac: 'Tabacalera La Flor', s: 4, notes: ['Pepper', 'Earth', 'Leather', 'Cedar'] },
  { b: 'La Flor Dominicana', n: 'Andalusian Bull', w: 'Habano', bi: 'Dominican Republic', f: 'Dominican Republic', o: 'Dominican Republic', fac: 'Tabacalera La Flor', s: 4, notes: ['Cedar', 'Spice', 'Leather', 'Sweet'], status: 'limited' },
  { b: 'La Flor Dominicana', n: 'Air Bender', w: 'Habano', bi: 'Dominican Republic', f: 'Dominican Republic', o: 'Dominican Republic', fac: 'Tabacalera La Flor', s: 4, notes: ['Pepper', 'Cedar', 'Earth', 'Sweet'], checked: true },
  { b: 'La Flor Dominicana', n: 'Cameroon Cabinet', w: 'Cameroon', f: 'Nicaragua, Dominican Republic', o: 'Dominican Republic', fac: 'Tabacalera La Flor', s: 3, notes: ['Cedar', 'Sweet', 'Nuts', 'Spice'], checked: true },

  // ----- Macanudo -----
  { b: 'Macanudo', n: 'Café', w: 'Connecticut', o: 'Dominican Republic', s: 1, notes: ['Cream', 'Nuts', 'Wood', 'Sweet'] },
  { b: 'Macanudo', n: 'Maduro', w: 'Broadleaf', o: 'Dominican Republic', s: 3, notes: ['Cocoa', 'Sweet', 'Coffee', 'Earth'] },

  // ----- Montecristo (Dominican) -----
  { b: 'Montecristo', n: 'White Series', w: 'Connecticut', o: 'Dominican Republic', s: 2, notes: ['Cream', 'Nuts', 'Cedar', 'Toast'] },
  { b: 'Montecristo', n: 'Classic', w: 'Connecticut', o: 'Dominican Republic', s: 2, notes: ['Cedar', 'Cream', 'Nuts', 'Wood'] },

  // ----- My Father (My Father Cigars, Estelí, Nicaragua) -----
  { b: 'My Father', n: 'My Father (Original)', w: 'Habano', bi: 'Nicaragua', f: 'Nicaragua', o: 'Nicaragua', fac: 'My Father Cigars', s: 4, notes: ['Pepper', 'Cedar', 'Cocoa', 'Spice'], checked: true },
  { b: 'My Father', n: 'Le Bijou 1922', w: 'Habano', bi: 'Nicaragua', f: 'Nicaragua', o: 'Nicaragua', fac: 'My Father Cigars', s: 5, notes: ['Pepper', 'Cocoa', 'Leather', 'Earth'] },
  { b: 'My Father', n: 'The Judge', w: 'Sumatra', bi: 'Nicaragua', f: 'Nicaragua', o: 'Nicaragua', fac: 'My Father Cigars', s: 4, notes: ['Pepper', 'Cedar', 'Sweet', 'Leather'], checked: true },
  { b: 'My Father', n: 'La Opulencia', w: 'San Andrés', bi: 'Nicaragua', f: 'Nicaragua', o: 'Nicaragua', fac: 'My Father Cigars', s: 5, notes: ['Pepper', 'Cocoa', 'Leather', 'Earth'], checked: true },
  { b: 'My Father', n: 'Flor de las Antillas', w: 'Habano', bi: 'Nicaragua', f: 'Nicaragua', o: 'Nicaragua', fac: 'My Father Cigars', s: 3, notes: ['Cedar', 'Spice', 'Sweet', 'Nuts'] },
  { b: 'My Father', n: 'Flor de las Antillas Maduro', w: 'Maduro', bi: 'Nicaragua', f: 'Nicaragua', o: 'Nicaragua', fac: 'My Father Cigars', s: 3, notes: ['Cocoa', 'Sweet', 'Coffee', 'Pepper'] },
  { b: 'My Father', n: 'Connecticut', w: 'Connecticut', bi: 'Nicaragua', f: 'Nicaragua', o: 'Nicaragua', fac: 'My Father Cigars', s: 2, notes: ['Cream', 'Cedar', 'Pepper', 'Nuts'] },

  // ----- Nub (Oliva) -----
  { b: 'Nub', n: 'Connecticut', w: 'Connecticut', o: 'Nicaragua', fac: 'Oliva', s: 2, notes: ['Cream', 'Cedar', 'Nuts', 'Wood'] },
  { b: 'Nub', n: 'Cameroon', w: 'Cameroon', o: 'Nicaragua', fac: 'Oliva', s: 3, notes: ['Cedar', 'Sweet', 'Spice', 'Wood'] },
  { b: 'Nub', n: 'Habano', w: 'Habano', o: 'Nicaragua', fac: 'Oliva', s: 3, notes: ['Spice', 'Cedar', 'Leather', 'Earth'] },
  { b: 'Nub', n: 'Maduro', w: 'Broadleaf', o: 'Nicaragua', fac: 'Oliva', s: 4, notes: ['Cocoa', 'Coffee', 'Sweet', 'Earth'] },

  // ----- Oliva (Tabacalera Oliva, Estelí, Nicaragua) — blends from olivacigar.com -----
  { b: 'Oliva', n: 'Connecticut Reserve', w: 'Connecticut', bi: 'Nicaragua', f: 'Nicaragua', o: 'Nicaragua', fac: 'Tabacalera Oliva', s: 2, notes: ['Cream', 'Nuts', 'Cedar', 'Toast'], checked: true },
  { b: 'Oliva', n: 'Serie G', w: 'Cameroon', bi: 'Nicaragua', f: 'Nicaragua', o: 'Nicaragua', fac: 'Tabacalera Oliva', s: 3, notes: ['Cedar', 'Nuts', 'Sweet', 'Wood'], checked: true },
  { b: 'Oliva', n: 'Serie G Maduro', w: 'San Andrés', bi: 'Mexico', f: 'Nicaragua', o: 'Nicaragua', fac: 'Tabacalera Oliva', s: 3, notes: ['Cocoa', 'Sweet', 'Coffee', 'Earth'], checked: true },
  { b: 'Oliva', n: 'Serie O', w: 'Habano', bi: 'Nicaragua', f: 'Nicaragua', o: 'Nicaragua', fac: 'Tabacalera Oliva', s: 3, notes: ['Cedar', 'Spice', 'Wood', 'Nuts'], checked: true },
  { b: 'Oliva', n: 'Serie O Maduro', w: 'Broadleaf', bi: 'Nicaragua', f: 'Nicaragua', o: 'Nicaragua', fac: 'Tabacalera Oliva', s: 4, notes: ['Cocoa', 'Coffee', 'Sweet', 'Earth'], checked: true },
  { b: 'Oliva', n: 'Serie V', w: 'Habano', bi: 'Nicaragua', f: 'Nicaragua', o: 'Nicaragua', fac: 'Tabacalera Oliva', s: 5, notes: ['Pepper', 'Leather', 'Earth', 'Coffee'], checked: true },
  { b: 'Oliva', n: 'Serie V Maduro', w: 'San Andrés', bi: 'Nicaragua', f: 'Nicaragua', o: 'Nicaragua', fac: 'Tabacalera Oliva', s: 5, notes: ['Cocoa', 'Coffee', 'Earth', 'Pepper'], checked: true },
  { b: 'Oliva', n: 'Serie V Melanio', w: 'Sumatra', bi: 'Nicaragua', f: 'Nicaragua', o: 'Nicaragua', fac: 'Tabacalera Oliva', s: 4, notes: ['Coffee', 'Cocoa', 'Spice', 'Cedar'], checked: true },
  { b: 'Oliva', n: 'Serie V Melanio Maduro', w: 'San Andrés', bi: 'Nicaragua', f: 'Nicaragua', o: 'Nicaragua', fac: 'Tabacalera Oliva', s: 4, notes: ['Cocoa', 'Coffee', 'Sweet', 'Earth'], checked: true },
  { b: 'Oliva', n: 'Master Blends 3', w: 'Broadleaf', bi: 'Nicaragua', f: 'Nicaragua', o: 'Nicaragua', fac: 'Tabacalera Oliva', s: 5, notes: ['Cocoa', 'Earth', 'Coffee', 'Leather'], checked: true },
  { b: 'Oliva', n: 'Gilberto Reserva', w: 'Sumatra', bi: 'Ecuador', f: 'Nicaragua', o: 'Nicaragua', fac: 'Tabacalera Oliva', s: 4, notes: ['Cedar', 'Spice', 'Nuts', 'Cocoa'], checked: true },
  { b: 'Oliva', n: 'Gilberto Reserva Blanc', w: 'Connecticut', bi: 'Ecuador', f: 'Nicaragua', o: 'Nicaragua', fac: 'Tabacalera Oliva', s: 2, notes: ['Cream', 'Nuts', 'Cedar', 'Honey'], checked: true },
  { b: 'Oliva', n: 'Flor de Oliva', w: 'Sumatra', bi: 'Nicaragua', f: 'Nicaragua', o: 'Nicaragua', fac: 'Tabacalera Oliva', s: 3, notes: ['Cedar', 'Wood', 'Nuts', 'Spice'], checked: true },
  { b: 'Oliva', n: 'Flor de Oliva Gold', w: 'Connecticut', bi: 'Nicaragua', f: 'Nicaragua', o: 'Nicaragua', fac: 'Tabacalera Oliva', s: 2, notes: ['Cream', 'Nuts', 'Wood', 'Toast'], checked: true },
  { b: 'Oliva', n: 'Flor de Oliva Corojo', w: 'Corojo', bi: 'Nicaragua', f: 'Nicaragua', o: 'Nicaragua', fac: 'Tabacalera Oliva', s: 3, notes: ['Spice', 'Cedar', 'Wood', 'Pepper'], checked: true },
  { b: 'Oliva', n: 'Flor de Oliva Maduro', w: 'Maduro', bi: 'Nicaragua', f: 'Nicaragua', o: 'Nicaragua', fac: 'Tabacalera Oliva', s: 3, notes: ['Cocoa', 'Sweet', 'Coffee', 'Wood'], checked: true },

  // ----- Padrón (Tabacos Cubanica, Estelí, Nicaragua) — all-Nicaraguan puros -----
  { b: 'Padrón', n: 'Dámaso', w: 'Connecticut', bi: 'Nicaragua', f: 'Nicaragua', o: 'Nicaragua', fac: 'Tabacos Cubanica', s: 2, notes: ['Cream', 'Nuts', 'Cedar', 'Toast'] },
  { b: 'Padrón', n: '2000 Natural', w: 'Habano', bi: 'Nicaragua', f: 'Nicaragua', o: 'Nicaragua', fac: 'Tabacos Cubanica', s: 3, notes: ['Earth', 'Cocoa', 'Wood', 'Pepper'] },
  { b: 'Padrón', n: '3000 Maduro', w: 'Maduro', bi: 'Nicaragua', f: 'Nicaragua', o: 'Nicaragua', fac: 'Tabacos Cubanica', s: 3, notes: ['Cocoa', 'Coffee', 'Earth', 'Sweet'] },
  { b: 'Padrón', n: '1964 Anniversary Natural', w: 'Habano', bi: 'Nicaragua', f: 'Nicaragua', o: 'Nicaragua', fac: 'Tabacos Cubanica', s: 4, notes: ['Cocoa', 'Earth', 'Spice', 'Wood'] },
  { b: 'Padrón', n: '1964 Anniversary Maduro', w: 'Maduro', bi: 'Nicaragua', f: 'Nicaragua', o: 'Nicaragua', fac: 'Tabacos Cubanica', s: 4, notes: ['Cocoa', 'Coffee', 'Earth', 'Sweet'] },
  { b: 'Padrón', n: '1926 Serie Natural', w: 'Habano', bi: 'Nicaragua', f: 'Nicaragua', o: 'Nicaragua', fac: 'Tabacos Cubanica', s: 5, notes: ['Cocoa', 'Earth', 'Leather', 'Spice'] },
  { b: 'Padrón', n: '1926 Serie No. 9 Maduro', w: 'Maduro', bi: 'Nicaragua', f: 'Nicaragua', o: 'Nicaragua', fac: 'Tabacos Cubanica', s: 5, notes: ['Cocoa', 'Coffee', 'Leather', 'Earth'] },
  { b: 'Padrón', n: 'Family Reserve 45 Years', w: 'Habano', bi: 'Nicaragua', f: 'Nicaragua', o: 'Nicaragua', fac: 'Tabacos Cubanica', s: 4, notes: ['Cocoa', 'Coffee', 'Earth', 'Sweet'] },
  { b: 'Padrón', n: 'Family Reserve 50 Years Maduro', w: 'Maduro', bi: 'Nicaragua', f: 'Nicaragua', o: 'Nicaragua', fac: 'Tabacos Cubanica', s: 4, notes: ['Cocoa', 'Coffee', 'Sweet', 'Leather'] },
  { b: 'Padrón', n: '50th Anniversary', w: 'Maduro', bi: 'Nicaragua', f: 'Nicaragua', o: 'Nicaragua', fac: 'Tabacos Cubanica', s: 4, notes: ['Cocoa', 'Coffee', 'Earth', 'Leather'], status: 'limited' },
  { b: 'Padrón', n: 'Black No. 99', w: 'Maduro', bi: 'Nicaragua', f: 'Nicaragua', o: 'Nicaragua', fac: 'Tabacos Cubanica', s: 4, notes: ['Cocoa', 'Coffee', 'Earth', 'Sweet'], status: 'limited' },

  // ----- Perdomo (Tabacalera Perdomo, Estelí, Nicaragua) -----
  { b: 'Perdomo', n: 'Reserve 10th Anniversary Champagne', w: 'Connecticut', bi: 'Nicaragua', f: 'Nicaragua', o: 'Nicaragua', fac: 'Tabacalera Perdomo', s: 2, notes: ['Cream', 'Nuts', 'Toast', 'Honey'] },
  { b: 'Perdomo', n: 'Reserve 10th Anniversary Maduro', w: 'Maduro', bi: 'Nicaragua', f: 'Nicaragua', o: 'Nicaragua', fac: 'Tabacalera Perdomo', s: 4, notes: ['Cocoa', 'Coffee', 'Earth', 'Sweet'] },
  { b: 'Perdomo', n: 'Reserve 10th Anniversary Sun Grown', w: 'Habano', bi: 'Nicaragua', f: 'Nicaragua', o: 'Nicaragua', fac: 'Tabacalera Perdomo', s: 4, notes: ['Spice', 'Cedar', 'Earth', 'Sweet'] },
  { b: 'Perdomo', n: '20th Anniversary Connecticut', w: 'Connecticut', bi: 'Nicaragua', f: 'Nicaragua', o: 'Nicaragua', fac: 'Tabacalera Perdomo', s: 2, notes: ['Cream', 'Nuts', 'Cedar', 'Toast'] },
  { b: 'Perdomo', n: '20th Anniversary Sun Grown', w: 'Habano', bi: 'Nicaragua', f: 'Nicaragua', o: 'Nicaragua', fac: 'Tabacalera Perdomo', s: 4, notes: ['Spice', 'Cedar', 'Leather', 'Sweet'], checked: true },
  { b: 'Perdomo', n: '20th Anniversary Maduro', w: 'Maduro', bi: 'Nicaragua', f: 'Nicaragua', o: 'Nicaragua', fac: 'Tabacalera Perdomo', s: 4, notes: ['Cocoa', 'Coffee', 'Sweet', 'Earth'] },
  { b: 'Perdomo', n: 'Habano Bourbon Barrel-Aged Connecticut', w: 'Connecticut', bi: 'Nicaragua', f: 'Nicaragua', o: 'Nicaragua', fac: 'Tabacalera Perdomo', s: 2, notes: ['Cream', 'Sweet', 'Wood', 'Nuts'] },
  { b: 'Perdomo', n: 'Habano Bourbon Barrel-Aged Sun Grown', w: 'Habano', bi: 'Nicaragua', f: 'Nicaragua', o: 'Nicaragua', fac: 'Tabacalera Perdomo', s: 3, notes: ['Sweet', 'Wood', 'Spice', 'Cedar'], checked: true },
  { b: 'Perdomo', n: 'Habano Bourbon Barrel-Aged Maduro', w: 'Maduro', bi: 'Nicaragua', f: 'Nicaragua', o: 'Nicaragua', fac: 'Tabacalera Perdomo', s: 4, notes: ['Cocoa', 'Sweet', 'Coffee', 'Wood'] },
  { b: 'Perdomo', n: 'Lot 23', w: 'Connecticut', bi: 'Nicaragua', f: 'Nicaragua', o: 'Nicaragua', fac: 'Tabacalera Perdomo', s: 3, notes: ['Cedar', 'Nuts', 'Sweet', 'Wood'] },
  { b: 'Perdomo', n: 'Lot 23 Maduro', w: 'Maduro', bi: 'Nicaragua', f: 'Nicaragua', o: 'Nicaragua', fac: 'Tabacalera Perdomo', s: 3, notes: ['Cocoa', 'Sweet', 'Coffee', 'Earth'] },

  // ----- Plasencia (Plasencia Cigars, Estelí, Nicaragua) -----
  { b: 'Plasencia', n: 'Alma Fuerte', w: 'Habano', bi: 'Nicaragua', f: 'Nicaragua', o: 'Nicaragua', fac: 'Plasencia Cigars', s: 5, notes: ['Pepper', 'Earth', 'Cocoa', 'Leather'], checked: true },
  { b: 'Plasencia', n: 'Alma del Fuego', w: 'Habano', bi: 'Nicaragua', f: 'Nicaragua', o: 'Nicaragua', fac: 'Plasencia Cigars', s: 4, notes: ['Cedar', 'Spice', 'Sweet', 'Earth'], checked: true },
  { b: 'Plasencia', n: 'Alma del Campo', w: 'Habano', bi: 'Nicaragua', f: 'Nicaragua', o: 'Nicaragua', fac: 'Plasencia Cigars', s: 3, notes: ['Cedar', 'Sweet', 'Nuts', 'Spice'], checked: true },
  { b: 'Plasencia', n: 'Reserva Original', w: 'Habano', bi: 'Nicaragua', f: 'Nicaragua', o: 'Nicaragua', fac: 'Plasencia Cigars', s: 3, notes: ['Cedar', 'Wood', 'Sweet', 'Nuts'] },

  // ----- Punch (Honduran) -----
  { b: 'Punch', n: 'Rothschild Maduro', w: 'Maduro', o: 'Honduras', s: 3, notes: ['Cocoa', 'Earth', 'Sweet', 'Wood'] },

  // ----- Rocky Patel -----
  { b: 'Rocky Patel', n: 'Vintage 1990', w: 'Broadleaf', o: 'Honduras', s: 3, notes: ['Cocoa', 'Sweet', 'Earth', 'Wood'] },
  { b: 'Rocky Patel', n: 'Vintage 1992', w: 'Sumatra', o: 'Honduras', s: 3, notes: ['Cedar', 'Spice', 'Nuts', 'Sweet'] },
  { b: 'Rocky Patel', n: 'Vintage 1999 Connecticut', w: 'Connecticut', bi: 'Mexico', f: 'Nicaragua, Dominican Republic', o: 'Honduras', s: 2, notes: ['Cream', 'Cedar', 'Nuts', 'Toast'], checked: true },
  { b: 'Rocky Patel', n: 'Vintage 2003 Cameroon', w: 'Cameroon', o: 'Honduras', s: 3, notes: ['Cedar', 'Sweet', 'Spice', 'Nuts'] },
  { b: 'Rocky Patel', n: 'Vintage 2006 San Andrés', w: 'San Andrés', o: 'Honduras', s: 4, notes: ['Cocoa', 'Earth', 'Coffee', 'Spice'] },
  { b: 'Rocky Patel', n: 'Decade', w: 'Sumatra', o: 'Honduras', s: 3, notes: ['Cedar', 'Spice', 'Sweet', 'Wood'] },
  { b: 'Rocky Patel', n: 'Sun Grown', w: 'Sumatra', bi: 'Nicaragua', f: 'Nicaragua, Dominican Republic', o: 'Honduras', s: 4, notes: ['Spice', 'Cedar', 'Earth', 'Sweet'], checked: true },
  { b: 'Rocky Patel', n: 'The Edge Corojo', w: 'Corojo', bi: 'Nicaragua', f: 'Honduras, Nicaragua', o: 'Honduras', s: 5, notes: ['Pepper', 'Spice', 'Earth', 'Leather'], checked: true },
  { b: 'Rocky Patel', n: 'The Edge Maduro', w: 'Maduro', o: 'Honduras', s: 4, notes: ['Cocoa', 'Coffee', 'Pepper', 'Earth'] },
  { b: 'Rocky Patel', n: 'The Edge Habano', w: 'Habano', o: 'Honduras', s: 4, notes: ['Spice', 'Pepper', 'Cedar', 'Earth'] },

  // ----- Romeo y Julieta (Dominican) -----
  { b: 'Romeo y Julieta', n: 'Reserva Real', w: 'Connecticut', o: 'Dominican Republic', s: 2, notes: ['Cedar', 'Cream', 'Nuts', 'Wood'] },
  { b: 'Romeo y Julieta', n: '1875', w: 'Sumatra', o: 'Dominican Republic', s: 2, notes: ['Cedar', 'Wood', 'Nuts', 'Sweet'] },

  // ----- Tatuaje -----
  { b: 'Tatuaje', n: 'Brown Label', w: 'Habano', o: 'Nicaragua', fac: 'My Father Cigars', s: 4, notes: ['Pepper', 'Earth', 'Leather', 'Cedar'] },
  { b: 'Tatuaje', n: 'Havana VI', w: 'Habano', bi: 'Nicaragua', f: 'Nicaragua', o: 'Nicaragua', fac: 'My Father Cigars', s: 4, notes: ['Pepper', 'Cedar', 'Earth', 'Sweet'], checked: true },
  { b: 'Tatuaje', n: 'Black Label', w: 'Habano', bi: 'Nicaragua', f: 'Nicaragua', o: 'Nicaragua', fac: 'My Father Cigars', s: 4, notes: ['Cocoa', 'Earth', 'Pepper', 'Leather'], checked: true },
  { b: 'Tatuaje', n: 'Reserva', w: 'Habano', bi: 'Nicaragua', f: 'Nicaragua', o: 'Nicaragua', fac: 'My Father Cigars', s: 4, notes: ['Pepper', 'Cedar', 'Leather', 'Sweet'] },
  { b: 'Tatuaje', n: 'Fausto', w: 'Maduro', bi: 'Nicaragua', f: 'Nicaragua', o: 'Nicaragua', fac: 'My Father Cigars', s: 5, notes: ['Cocoa', 'Pepper', 'Earth', 'Coffee'], checked: true },
  { b: 'Tatuaje', n: 'Series P', w: 'Habano', bi: 'Nicaragua', f: 'Nicaragua', o: 'Nicaragua', fac: 'My Father Cigars', s: 3, notes: ['Pepper', 'Cedar', 'Earth', 'Wood'], checked: true },

  // ----- Te-Amo (Mexico) -----
  { b: 'Te-Amo', n: 'Robusto', w: 'San Andrés', o: 'Mexico', s: 3, notes: ['Earth', 'Sweet', 'Cocoa', 'Wood'] },

  // ============================================================
  //  Added in the 500+ expansion (grouped by brand; Browse sorts them for you)
  // ============================================================

  // ----- Aganorsa Leaf (Nicaragua) -----
  { b: 'Aganorsa Leaf', n: 'Signature Selection', w: 'Corojo', bi: 'Nicaragua', f: 'Nicaragua', o: 'Nicaragua', fac: 'Aganorsa Leaf', s: 4, notes: ['Spice', 'Cedar', 'Sweet', 'Earth'] },
  { b: 'Aganorsa Leaf', n: 'Supreme Leaf', w: 'Corojo', bi: 'Nicaragua', f: 'Nicaragua', o: 'Nicaragua', fac: 'Aganorsa Leaf', s: 4, notes: ['Pepper', 'Cedar', 'Earth', 'Leather'] },
  { b: 'Aganorsa Leaf', n: 'Rare Leaf Reserve Maduro', w: 'Maduro', bi: 'Nicaragua', f: 'Nicaragua', o: 'Nicaragua', fac: 'Aganorsa Leaf', s: 4, notes: ['Cocoa', 'Coffee', 'Earth', 'Spice'] },
  { b: 'Aganorsa Leaf', n: 'JFR Lunatic', w: 'Habano', bi: 'Nicaragua', f: 'Nicaragua', o: 'Nicaragua', fac: 'Aganorsa Leaf', s: 4, notes: ['Pepper', 'Earth', 'Cedar', 'Leather'] },

  // ----- Aladino (JRE Tobacco, Honduras) -----
  { b: 'Aladino', n: 'Corojo', w: 'Corojo', bi: 'Honduras', f: 'Honduras', o: 'Honduras', fac: 'JRE Tobacco', s: 4, notes: ['Cedar', 'Spice', 'Sweet', 'Earth'] },
  { b: 'Aladino', n: 'Cameroon', w: 'Cameroon', bi: 'Honduras', f: 'Honduras', o: 'Honduras', fac: 'JRE Tobacco', s: 3, notes: ['Cedar', 'Sweet', 'Nuts', 'Spice'] },

  // ----- Alec Bradley (more) -----
  { b: 'Alec Bradley', n: 'Connecticut', w: 'Connecticut', o: 'Honduras', s: 2, notes: ['Cream', 'Cedar', 'Nuts', 'Toast'] },
  { b: 'Alec Bradley', n: 'Nica Puro', w: 'Habano', bi: 'Nicaragua', f: 'Nicaragua', o: 'Nicaragua', s: 4, notes: ['Pepper', 'Cedar', 'Earth', 'Sweet'] },
  { b: 'Alec Bradley', n: 'Magic Toast', w: 'Habano', o: 'Honduras', s: 4, notes: ['Toast', 'Spice', 'Cedar', 'Earth'] },
  { b: 'Alec Bradley', n: 'Post Embargo', w: 'Habano', o: 'Honduras', s: 3, notes: ['Cedar', 'Sweet', 'Spice', 'Nuts'] },

  // ----- AJ Fernandez (more) -----
  { b: 'AJ Fernandez', n: 'New World Dorado', w: 'Habano', bi: 'Nicaragua', f: 'Nicaragua', o: 'Nicaragua', fac: 'Tabacalera AJ Fernandez', s: 3, notes: ['Cedar', 'Sweet', 'Nuts', 'Spice'] },
  { b: 'AJ Fernandez', n: 'Días de Gloria', w: 'Habano', o: 'Nicaragua', fac: 'Tabacalera AJ Fernandez', s: 4, notes: ['Cocoa', 'Cedar', 'Pepper', 'Sweet'] },
  { b: 'AJ Fernandez', n: 'Enclave Broadleaf', w: 'Broadleaf', o: 'Nicaragua', fac: 'Tabacalera AJ Fernandez', s: 4, notes: ['Cocoa', 'Sweet', 'Earth', 'Coffee'] },
  { b: 'AJ Fernandez', n: 'Last Call Maduro', w: 'Maduro', o: 'Nicaragua', fac: 'Tabacalera AJ Fernandez', s: 4, notes: ['Cocoa', 'Coffee', 'Pepper', 'Earth'] },

  // ----- Asylum -----
  { b: 'Asylum', n: '13', w: 'Habano', o: 'Honduras', s: 4, notes: ['Pepper', 'Earth', 'Cedar', 'Spice'] },

  // ----- AVO (more) -----
  { b: 'AVO', n: 'XO', w: 'Connecticut', o: 'Dominican Republic', s: 3, notes: ['Cedar', 'Cream', 'Spice', 'Nuts'] },
  { b: 'AVO', n: 'Syncro Nicaragua', w: 'Habano', o: 'Dominican Republic', s: 3, notes: ['Cedar', 'Spice', 'Sweet', 'Leather'] },
  { b: 'AVO', n: 'Heritage', w: 'Sumatra', o: 'Dominican Republic', s: 4, notes: ['Spice', 'Cedar', 'Leather', 'Earth'] },

  // ----- Black Label Trading Co. (Fabrica Oveja Negra, Nicaragua) -----
  { b: 'Black Label Trading Co.', n: 'Bishops Blend', w: 'Broadleaf', o: 'Nicaragua', fac: 'Fabrica Oveja Negra', s: 5, notes: ['Earth', 'Cocoa', 'Pepper', 'Leather'] },
  { b: 'Black Label Trading Co.', n: 'Salvation', w: 'Habano', o: 'Nicaragua', fac: 'Fabrica Oveja Negra', s: 4, notes: ['Pepper', 'Cedar', 'Cocoa', 'Earth'] },

  // ----- Brick House (more) -----
  { b: 'Brick House', n: 'Double Connecticut', w: 'Connecticut', o: 'Nicaragua', fac: 'J.C. Newman', s: 2, notes: ['Cream', 'Nuts', 'Cedar', 'Toast'] },
  { b: 'Brick House', n: 'Maduro', w: 'Maduro', o: 'Nicaragua', fac: 'J.C. Newman', s: 3, notes: ['Cocoa', 'Sweet', 'Coffee', 'Earth'] },

  // ----- CAO (more) -----
  { b: 'CAO', n: 'Gold', w: 'Connecticut', o: 'Nicaragua', s: 2, notes: ['Cream', 'Nuts', 'Cedar', 'Honey'] },
  { b: 'CAO', n: 'Brazilia', w: 'Other', o: 'Nicaragua', s: 4, notes: ['Cocoa', 'Coffee', 'Sweet', 'Earth'] },
  { b: 'CAO', n: 'Pilón', w: 'Habano', o: 'Nicaragua', s: 3, notes: ['Cedar', 'Sweet', 'Nuts', 'Spice'] },
  { b: 'CAO', n: 'MX2', w: 'Broadleaf', o: 'Honduras', s: 4, notes: ['Cocoa', 'Earth', 'Sweet', 'Pepper'] },
  { b: 'CAO', n: 'America', w: 'Other', bi: 'Brazil', f: 'USA, Nicaragua, Italy, Dominican Republic', o: 'Honduras', s: 3, notes: ['Sweet', 'Cedar', 'Earth', 'Cream'], checked: true },
  { b: 'CAO', n: 'CX2', w: 'Cameroon', bi: 'Cameroon', f: 'Nicaragua, Colombia', o: 'Nicaragua', s: 3, notes: ['Cedar', 'Sweet', 'Spice', 'Nuts'], checked: true },
  { b: 'CAO', n: 'Consigliere', w: 'Other', bi: 'Honduras', f: 'Nicaragua, Dominican Republic, Colombia', o: 'Nicaragua', s: 4, notes: ['Cocoa', 'Earth', 'Spice', 'Sweet'], checked: true },
  { b: 'CAO', n: 'Nicaragua', w: 'Habano', o: 'Nicaragua', s: 4, notes: ['Pepper', 'Cedar', 'Earth', 'Leather'] },
  { b: 'CAO', n: 'Fasa Sol', w: 'Other', bi: 'Cameroon', f: 'Dominican Republic, Nicaragua', o: 'Nicaragua', s: 3, notes: ['Cedar', 'Spice', 'Sweet', 'Nuts'], checked: true },
  { b: 'CAO', n: 'Fasa Noche', w: 'Broadleaf', bi: 'Cameroon', f: 'Dominican Republic, Nicaragua', o: 'Nicaragua', s: 4, notes: ['Cocoa', 'Sweet', 'Earth', 'Spice'], checked: true },

  // ----- Caldwell (Dominican Republic) -----
  { b: 'Caldwell', n: 'Long Live the King', w: 'Habano', o: 'Dominican Republic', s: 4, notes: ['Cedar', 'Spice', 'Sweet', 'Leather'] },
  { b: 'Caldwell', n: 'The King Is Dead', w: 'Habano', o: 'Dominican Republic', s: 4, notes: ['Pepper', 'Cedar', 'Earth', 'Spice'] },
  { b: 'Caldwell', n: 'Blind Man\'s Bluff Connecticut', w: 'Connecticut', o: 'Dominican Republic', s: 2, notes: ['Cream', 'Nuts', 'Cedar', 'Honey'] },

  // ----- Camacho (more) -----
  { b: 'Camacho', n: 'Broadleaf', w: 'Broadleaf', o: 'Honduras', s: 4, notes: ['Cocoa', 'Earth', 'Sweet', 'Pepper'] },
  { b: 'Camacho', n: 'Corojo Maduro', w: 'Maduro', o: 'Honduras', s: 4, notes: ['Cocoa', 'Pepper', 'Coffee', 'Earth'] },

  // ----- Casa Magna (Nicaragua) -----
  { b: 'Casa Magna', n: 'Colorado', w: 'Habano', bi: 'Nicaragua', f: 'Nicaragua', o: 'Nicaragua', s: 4, notes: ['Cedar', 'Spice', 'Pepper', 'Sweet'] },
  { b: 'Casa Magna', n: 'Oscuro', w: 'Maduro', bi: 'Nicaragua', f: 'Nicaragua', o: 'Nicaragua', s: 5, notes: ['Cocoa', 'Earth', 'Pepper', 'Leather'] },

  // ----- CLE (Honduras) -----
  { b: 'CLE', n: 'Corojo', w: 'Corojo', o: 'Honduras', s: 4, notes: ['Spice', 'Cedar', 'Earth', 'Sweet'] },
  { b: 'CLE', n: 'Connecticut', w: 'Connecticut', o: 'Honduras', s: 2, notes: ['Cream', 'Nuts', 'Cedar', 'Toast'] },
  { b: 'CLE', n: 'Habano', w: 'Habano', o: 'Honduras', s: 3, notes: ['Cedar', 'Spice', 'Sweet', 'Earth'] },

  // ----- Cohiba (Dominican, more) -----
  { b: 'Cohiba', n: 'Connecticut', w: 'Connecticut', o: 'Dominican Republic', s: 2, notes: ['Cream', 'Cedar', 'Nuts', 'Honey'] },
  { b: 'Cohiba', n: 'Nicaragua', w: 'Habano', o: 'Nicaragua', s: 4, notes: ['Pepper', 'Earth', 'Cocoa', 'Leather'] },

  // ----- Diesel (made by AJ Fernandez, Nicaragua) -----
  { b: 'Diesel', n: 'Unholy Cocktail', w: 'Broadleaf', o: 'Nicaragua', fac: 'Tabacalera AJ Fernandez', s: 5, notes: ['Cocoa', 'Earth', 'Pepper', 'Coffee'] },
  { b: 'Diesel', n: 'Whiskey Row', w: 'San Andrés', o: 'Nicaragua', fac: 'Tabacalera AJ Fernandez', s: 4, notes: ['Sweet', 'Wood', 'Cocoa', 'Spice'] },

  // ----- Drew Estate (more) -----
  { b: 'Drew Estate', n: 'Liga Privada H99', w: 'Corojo', o: 'Nicaragua', fac: 'La Gran Fabrica Drew Estate', s: 4, notes: ['Pepper', 'Cedar', 'Earth', 'Sweet'] },
  { b: 'Drew Estate', n: 'Liga Privada Único Papas Fritas', w: 'Broadleaf', o: 'Nicaragua', fac: 'La Gran Fabrica Drew Estate', s: 4, notes: ['Coffee', 'Cocoa', 'Earth', 'Sweet'] },
  { b: 'Drew Estate', n: 'Herrera Estelí Brazilian Maduro', w: 'Maduro', o: 'Nicaragua', fac: 'La Gran Fabrica Drew Estate', s: 4, notes: ['Cocoa', 'Sweet', 'Earth', 'Coffee'] },
  { b: 'Drew Estate', n: 'Tabak Especial Dulce', w: 'Maduro', o: 'Nicaragua', fac: 'La Gran Fabrica Drew Estate', s: 2, notes: ['Coffee', 'Sweet', 'Cream', 'Cocoa'] },
  { b: 'Drew Estate', n: 'Tabak Especial Negra', w: 'Maduro', o: 'Nicaragua', fac: 'La Gran Fabrica Drew Estate', s: 3, notes: ['Coffee', 'Cocoa', 'Earth', 'Sweet'] },
  { b: 'Drew Estate', n: 'Acid Blondie', w: 'Connecticut', o: 'Nicaragua', fac: 'La Gran Fabrica Drew Estate', s: 1, notes: ['Sweet', 'Floral', 'Cream', 'Honey'] },
  { b: 'Drew Estate', n: 'Acid 1400cc', w: 'Broadleaf', o: 'Nicaragua', fac: 'La Gran Fabrica Drew Estate', s: 3, notes: ['Sweet', 'Cocoa', 'Floral', 'Earth'] },
  { b: 'Drew Estate', n: 'MUWAT Bait Fish', w: 'Broadleaf', o: 'Nicaragua', fac: 'La Gran Fabrica Drew Estate', s: 4, notes: ['Earth', 'Cocoa', 'Pepper', 'Leather'] },

  // ----- Dunbarton Tobacco & Trust (Nicaragua) -----
  { b: 'Dunbarton', n: 'Sobremesa', w: 'Habano', o: 'Nicaragua', s: 4, notes: ['Cedar', 'Cream', 'Spice', 'Cocoa'] },
  { b: 'Dunbarton', n: 'Sobremesa Brûlée', w: 'Connecticut', o: 'Nicaragua', s: 3, notes: ['Cream', 'Sweet', 'Nuts', 'Toast'] },
  { b: 'Dunbarton', n: 'Mi Querida', w: 'Broadleaf', o: 'Nicaragua', s: 4, notes: ['Cocoa', 'Earth', 'Sweet', 'Pepper'] },
  { b: 'Dunbarton', n: 'Umbagog', w: 'Broadleaf', bi: 'Nicaragua', f: 'Nicaragua', o: 'Nicaragua', fac: 'NACSA', s: 4, notes: ['Earth', 'Cocoa', 'Leather', 'Sweet'], checked: true },
  { b: 'Dunbarton', n: 'Sin Compromiso', w: 'Habano', o: 'Nicaragua', s: 4, notes: ['Cedar', 'Cocoa', 'Spice', 'Leather'] },

  // ----- E.P. Carrillo (Tabacalera La Alianza, Dominican Republic) -----
  { b: 'E.P. Carrillo', n: 'Pledge', w: 'Habano', o: 'Dominican Republic', fac: 'Tabacalera La Alianza', s: 4, notes: ['Cocoa', 'Coffee', 'Earth', 'Spice'] },
  { b: 'E.P. Carrillo', n: 'INCH Natural', w: 'Habano', o: 'Dominican Republic', fac: 'Tabacalera La Alianza', s: 4, notes: ['Cedar', 'Spice', 'Leather', 'Sweet'] },
  { b: 'E.P. Carrillo', n: 'INCH Maduro', w: 'San Andrés', o: 'Dominican Republic', fac: 'Tabacalera La Alianza', s: 4, notes: ['Cocoa', 'Coffee', 'Sweet', 'Earth'] },
  { b: 'E.P. Carrillo', n: 'La Historia', w: 'Habano', o: 'Dominican Republic', fac: 'Tabacalera La Alianza', s: 4, notes: ['Cocoa', 'Leather', 'Cedar', 'Spice'] },
  { b: 'E.P. Carrillo', n: 'New Wave Connecticut', w: 'Connecticut', o: 'Dominican Republic', fac: 'Tabacalera La Alianza', s: 2, notes: ['Cream', 'Nuts', 'Cedar', 'Honey'] },

  // ----- Espinosa (La Zona, Nicaragua) -----
  { b: 'Espinosa', n: 'Laranja Reserva', w: 'Other', o: 'Nicaragua', fac: 'La Zona', s: 4, notes: ['Citrus', 'Sweet', 'Spice', 'Cedar'] },
  { b: 'Espinosa', n: 'Habano', w: 'Habano', o: 'Nicaragua', fac: 'La Zona', s: 4, notes: ['Pepper', 'Cedar', 'Earth', 'Sweet'] },

  // ----- Foundation (more) -----
  { b: 'Foundation', n: 'The Wise Man (El Güegüense)', w: 'Corojo', bi: 'Nicaragua', f: 'Nicaragua', o: 'Nicaragua', s: 4, notes: ['Cedar', 'Spice', 'Sweet', 'Cream'] },
  { b: 'Foundation', n: 'The Wise Man Maduro', w: 'San Andrés', bi: 'Nicaragua', f: 'Nicaragua', o: 'Nicaragua', s: 4, notes: ['Cocoa', 'Coffee', 'Sweet', 'Earth'], checked: true },
  { b: 'Foundation', n: 'Charter Oak Connecticut', w: 'Connecticut', o: 'Nicaragua', s: 2, notes: ['Cream', 'Nuts', 'Cedar', 'Toast'] },
  { b: 'Foundation', n: 'Charter Oak Habano', w: 'Habano', bi: 'Nicaragua', f: 'Nicaragua', o: 'Nicaragua', s: 3, notes: ['Cedar', 'Spice', 'Sweet', 'Earth'], checked: true },
  { b: 'Foundation', n: 'Charter Oak Maduro', w: 'Broadleaf', o: 'Nicaragua', s: 3, notes: ['Cocoa', 'Sweet', 'Earth', 'Coffee'] },
  { b: 'Foundation', n: 'Olmec Claro', w: 'San Andrés', o: 'Nicaragua', s: 3, notes: ['Earth', 'Sweet', 'Cedar', 'Spice'] },
  { b: 'Foundation', n: 'Olmec Maduro', w: 'San Andrés', o: 'Nicaragua', s: 4, notes: ['Cocoa', 'Earth', 'Coffee', 'Sweet'] },
  { b: 'Foundation', n: 'Highclere Castle', w: 'Connecticut', o: 'Nicaragua', s: 2, notes: ['Cream', 'Cedar', 'Floral', 'Nuts'] },

  // ----- Gran Habano (Honduras) -----
  { b: 'Gran Habano', n: '#1 Connecticut', w: 'Connecticut', o: 'Honduras', s: 2, notes: ['Cream', 'Nuts', 'Cedar', 'Toast'] },
  { b: 'Gran Habano', n: '#3 Habano', w: 'Habano', o: 'Honduras', s: 3, notes: ['Cedar', 'Spice', 'Sweet', 'Earth'] },
  { b: 'Gran Habano', n: '#5 Corojo', w: 'Corojo', o: 'Honduras', s: 4, notes: ['Pepper', 'Spice', 'Earth', 'Leather'] },

  // ----- Gurkha (Dominican Republic) -----
  { b: 'Gurkha', n: 'Cellar Reserve', w: 'Corojo', bi: 'Dominican Republic', f: 'Dominican Republic', o: 'Dominican Republic', s: 4, notes: ['Cedar', 'Leather', 'Spice', 'Sweet'], checked: true },
  { b: 'Gurkha', n: 'Royal Challenge', w: 'Connecticut', bi: 'Honduras', f: 'Dominican Republic, Nicaragua', o: 'Dominican Republic', s: 2, notes: ['Cream', 'Cedar', 'Nuts', 'Wood'], checked: true },

  // ----- H. Upmann (Dominican & Nicaraguan) -----
  { b: 'H. Upmann', n: 'Vintage Cameroon', w: 'Cameroon', bi: 'Nicaragua', f: 'Dominican Republic, Nicaragua, Peru', o: 'Dominican Republic', fac: 'Tabacalera de García', s: 3, notes: ['Cedar', 'Sweet', 'Nuts', 'Spice'], checked: true },
  { b: 'H. Upmann', n: '1844 Reserve', w: 'Habano', o: 'Dominican Republic', fac: 'Tabacalera de García', s: 3, notes: ['Cedar', 'Cream', 'Nuts', 'Spice'] },
  { b: 'H. Upmann', n: 'The Banker', w: 'Habano', o: 'Dominican Republic', fac: 'Tabacalera de García', s: 3, notes: ['Cedar', 'Leather', 'Sweet', 'Nuts'] },
  { b: 'H. Upmann', n: 'Nicaragua by AJ Fernandez', w: 'Other', bi: 'Nicaragua', f: 'Nicaragua', o: 'Nicaragua', fac: 'Tabacalera AJ Fernandez', s: 4, notes: ['Cocoa', 'Pepper', 'Earth', 'Sweet'], checked: true },

  // ----- Hiram & Solomon (made by Plasencia, Nicaragua) -----
  { b: 'Hiram & Solomon', n: 'Fraternity', w: 'Habano', o: 'Nicaragua', fac: 'Plasencia Cigars', s: 3, notes: ['Cedar', 'Sweet', 'Spice', 'Nuts'] },

  // ----- Hoyo de Monterrey (Honduran) -----
  { b: 'Hoyo de Monterrey', n: 'Excalibur', w: 'Connecticut', o: 'Honduras', s: 2, notes: ['Cream', 'Cedar', 'Nuts', 'Wood'] },
  { b: 'Hoyo de Monterrey', n: 'Dark Sumatra', w: 'Sumatra', o: 'Honduras', s: 3, notes: ['Cocoa', 'Earth', 'Sweet', 'Spice'] },
  { b: 'Hoyo de Monterrey', n: 'La Amistad', w: 'Habano', o: 'Nicaragua', fac: 'Tabacalera AJ Fernandez', s: 4, notes: ['Pepper', 'Cocoa', 'Earth', 'Leather'] },

  // ----- Illusione (Nicaragua) -----
  { b: 'Illusione', n: 'Epernay', w: 'Habano', o: 'Nicaragua', s: 3, notes: ['Cream', 'Cedar', 'Floral', 'Nuts'] },
  { b: 'Illusione', n: 'Rothchildes', w: 'Habano', o: 'Nicaragua', s: 3, notes: ['Cedar', 'Sweet', 'Spice', 'Wood'] },
  { b: 'Illusione', n: 'Fume d\'Amour', w: 'Corojo', o: 'Nicaragua', s: 3, notes: ['Cedar', 'Sweet', 'Floral', 'Spice'] },

  // ----- Java (by Drew Estate, more) -----
  { b: 'Java', n: 'Latte', w: 'Connecticut', o: 'Nicaragua', fac: 'La Gran Fabrica Drew Estate', s: 1, notes: ['Coffee', 'Cream', 'Sweet', 'Nuts'] },
  { b: 'Java', n: 'Mint', w: 'Maduro', o: 'Nicaragua', fac: 'La Gran Fabrica Drew Estate', s: 2, notes: ['Coffee', 'Cocoa', 'Sweet', 'Cream'] },

  // ----- Joya de Nicaragua (more) -----
  { b: 'Joya de Nicaragua', n: 'Antaño Dark Corojo', w: 'Corojo', o: 'Nicaragua', s: 5, notes: ['Pepper', 'Earth', 'Leather', 'Cocoa'] },
  { b: 'Joya de Nicaragua', n: 'Joya Red', w: 'Habano', o: 'Nicaragua', s: 3, notes: ['Cedar', 'Sweet', 'Spice', 'Nuts'] },
  { b: 'Joya de Nicaragua', n: 'Joya Black', w: 'Maduro', o: 'Nicaragua', s: 3, notes: ['Cocoa', 'Coffee', 'Sweet', 'Earth'] },
  { b: 'Joya de Nicaragua', n: 'Joya Silver', w: 'Habano', o: 'Nicaragua', s: 4, notes: ['Pepper', 'Cedar', 'Earth', 'Leather'] },
  { b: 'Joya de Nicaragua', n: 'Cabinetta', w: 'Connecticut', o: 'Nicaragua', s: 2, notes: ['Cream', 'Cedar', 'Nuts', 'Sweet'] },
  { b: 'Joya de Nicaragua', n: 'Cuatro Cinco', w: 'Habano', o: 'Nicaragua', s: 4, notes: ['Cocoa', 'Cedar', 'Earth', 'Sweet'], status: 'limited' },

  // ----- J.C. Newman -----
  { b: 'J.C. Newman', n: 'Perla del Mar', w: 'Connecticut', o: 'Nicaragua', s: 2, notes: ['Cream', 'Nuts', 'Sweet', 'Cedar'] },

  // ----- Kristoff (Dominican Republic) -----
  { b: 'Kristoff', n: 'Corojo Limitada', w: 'Corojo', o: 'Dominican Republic', s: 4, notes: ['Spice', 'Cedar', 'Pepper', 'Earth'] },
  { b: 'Kristoff', n: 'Ligero Maduro', w: 'Maduro', o: 'Dominican Republic', s: 5, notes: ['Cocoa', 'Earth', 'Coffee', 'Pepper'] },
  { b: 'Kristoff', n: 'Connecticut', w: 'Connecticut', o: 'Dominican Republic', s: 2, notes: ['Cream', 'Cedar', 'Nuts', 'Toast'] },

  // ----- La Aroma de Cuba (more) -----
  { b: 'La Aroma de Cuba', n: 'Edición Especial', w: 'Habano', o: 'Nicaragua', fac: 'My Father Cigars', s: 4, notes: ['Pepper', 'Cedar', 'Cocoa', 'Sweet'] },

  // ----- La Flor Dominicana (more) -----
  { b: 'La Flor Dominicana', n: 'Colorado Oscuro', w: 'Habano', o: 'Dominican Republic', fac: 'Tabacalera La Flor', s: 4, notes: ['Earth', 'Leather', 'Cocoa', 'Spice'] },

  // ----- La Gloria Cubana (non-Cuban) -----
  { b: 'La Gloria Cubana', n: 'Classic', w: 'Sumatra', o: 'Dominican Republic', s: 3, notes: ['Cedar', 'Spice', 'Nuts', 'Sweet'] },
  { b: 'La Gloria Cubana', n: 'Serie R', w: 'Sumatra', o: 'Dominican Republic', s: 4, notes: ['Spice', 'Cedar', 'Earth', 'Leather'] },
  { b: 'La Gloria Cubana', n: 'Serie R Estelí', w: 'Habano', o: 'Nicaragua', s: 4, notes: ['Pepper', 'Earth', 'Cocoa', 'Leather'] },

  // ----- Leaf by Oscar (Honduras) -----
  { b: 'Leaf by Oscar', n: 'Connecticut', w: 'Connecticut', o: 'Honduras', s: 2, notes: ['Cream', 'Cedar', 'Nuts', 'Honey'] },
  { b: 'Leaf by Oscar', n: 'Corojo', w: 'Corojo', o: 'Honduras', s: 4, notes: ['Spice', 'Cedar', 'Earth', 'Pepper'] },
  { b: 'Leaf by Oscar', n: 'Maduro', w: 'Maduro', o: 'Honduras', s: 4, notes: ['Cocoa', 'Coffee', 'Sweet', 'Earth'] },
  { b: 'Leaf by Oscar', n: 'Sumatra', w: 'Sumatra', o: 'Honduras', s: 3, notes: ['Cedar', 'Spice', 'Sweet', 'Wood'] },

  // ----- Macanudo (more) -----
  { b: 'Macanudo', n: 'Gold Label', w: 'Connecticut', o: 'Dominican Republic', s: 2, notes: ['Cream', 'Honey', 'Nuts', 'Cedar'] },
  { b: 'Macanudo', n: 'Vintage', w: 'Connecticut', o: 'Dominican Republic', s: 2, notes: ['Cream', 'Cedar', 'Nuts', 'Toast'], status: 'limited' },
  { b: 'Macanudo', n: 'Estate Reserve', w: 'Connecticut', bi: 'Dominican Republic', f: 'Dominican Republic', o: 'Dominican Republic', s: 2, notes: ['Cream', 'Cedar', 'Honey', 'Nuts'], status: 'limited', checked: true },
  { b: 'Macanudo', n: 'Inspirado White', w: 'Connecticut', o: 'Honduras', s: 2, notes: ['Cream', 'Cedar', 'Nuts', 'Pepper'] },
  { b: 'Macanudo', n: 'Inspirado Black', w: 'Broadleaf', o: 'Honduras', s: 4, notes: ['Cocoa', 'Earth', 'Coffee', 'Pepper'] },

  // ----- Montecristo (Dominican & Nicaraguan, more) -----
  { b: 'Montecristo', n: 'Espada', w: 'Habano', o: 'Dominican Republic', s: 4, notes: ['Spice', 'Cedar', 'Leather', 'Earth'] },
  { b: 'Montecristo', n: '1935 Anniversary Nicaragua', w: 'Habano', o: 'Nicaragua', s: 4, notes: ['Cocoa', 'Earth', 'Spice', 'Cedar'] },

  // ----- My Father (more) -----
  { b: 'My Father', n: 'El Centurion', w: 'Habano', o: 'Nicaragua', fac: 'My Father Cigars', s: 4, notes: ['Pepper', 'Cedar', 'Sweet', 'Earth'] },

  // ----- Nub (more) -----
  { b: 'Nub', n: 'Sumatra', w: 'Sumatra', o: 'Nicaragua', fac: 'Oliva', s: 3, notes: ['Cedar', 'Spice', 'Sweet', 'Wood'] },

  // ----- Oscar Valladares (Honduras) -----
  { b: 'Oscar Valladares', n: '2012 Connecticut', w: 'Connecticut', o: 'Honduras', s: 2, notes: ['Cream', 'Cedar', 'Nuts', 'Toast'] },
  { b: 'Oscar Valladares', n: '2012 Maduro', w: 'Maduro', o: 'Honduras', s: 4, notes: ['Cocoa', 'Coffee', 'Sweet', 'Earth'] },

  // ----- Partagás (Dominican) -----
  { b: 'Partagás', n: 'Classic Cameroon', w: 'Cameroon', o: 'Dominican Republic', s: 3, notes: ['Cedar', 'Spice', 'Sweet', 'Nuts'] },

  // ----- Perdomo (more) -----
  { b: 'Perdomo', n: 'Double Aged 12 Year Vintage Connecticut', w: 'Connecticut', bi: 'Nicaragua', f: 'Nicaragua', o: 'Nicaragua', fac: 'Tabacalera Perdomo', s: 2, notes: ['Cream', 'Nuts', 'Cedar', 'Honey'] },
  { b: 'Perdomo', n: 'Double Aged 12 Year Vintage Sun Grown', w: 'Habano', bi: 'Nicaragua', f: 'Nicaragua', o: 'Nicaragua', fac: 'Tabacalera Perdomo', s: 4, notes: ['Spice', 'Cedar', 'Sweet', 'Earth'] },
  { b: 'Perdomo', n: 'Double Aged 12 Year Vintage Maduro', w: 'Maduro', bi: 'Nicaragua', f: 'Nicaragua', o: 'Nicaragua', fac: 'Tabacalera Perdomo', s: 4, notes: ['Cocoa', 'Coffee', 'Sweet', 'Earth'] },
  { b: 'Perdomo', n: 'Slow-Aged 826 Connecticut', w: 'Connecticut', o: 'Nicaragua', fac: 'Tabacalera Perdomo', s: 2, notes: ['Cream', 'Cedar', 'Nuts', 'Toast'] },
  { b: 'Perdomo', n: 'Slow-Aged 826 Sun Grown', w: 'Habano', o: 'Nicaragua', fac: 'Tabacalera Perdomo', s: 3, notes: ['Cedar', 'Spice', 'Sweet', 'Earth'] },
  { b: 'Perdomo', n: 'Slow-Aged 826 Maduro', w: 'Maduro', o: 'Nicaragua', fac: 'Tabacalera Perdomo', s: 4, notes: ['Cocoa', 'Coffee', 'Earth', 'Sweet'] },

  // ----- Plasencia (more) -----
  { b: 'Plasencia', n: 'Cosecha 146', w: 'Habano', o: 'Honduras', fac: 'Plasencia Cigars', s: 3, notes: ['Cedar', 'Sweet', 'Earth', 'Spice'] },

  // ----- Punch (Honduran, more) -----
  { b: 'Punch', n: 'Classic', w: 'Sumatra', o: 'Honduras', s: 3, notes: ['Cedar', 'Earth', 'Sweet', 'Wood'] },
  { b: 'Punch', n: 'Signature', w: 'Habano', o: 'Honduras', s: 4, notes: ['Spice', 'Cedar', 'Earth', 'Leather'] },
  { b: 'Punch', n: 'Knuckle Buster', w: 'Habano', o: 'Honduras', s: 4, notes: ['Pepper', 'Earth', 'Leather', 'Spice'] },
  { b: 'Punch', n: 'Gran Puro', w: 'Other', o: 'Honduras', s: 4, notes: ['Earth', 'Cedar', 'Spice', 'Leather'] },

  // ----- Quorum (Nicaragua) -----
  { b: 'Quorum', n: 'Classic', w: 'Habano', o: 'Nicaragua', s: 3, notes: ['Cedar', 'Wood', 'Nuts', 'Sweet'] },
  { b: 'Quorum', n: 'Maduro', w: 'Maduro', o: 'Nicaragua', s: 3, notes: ['Cocoa', 'Sweet', 'Earth', 'Wood'] },
  { b: 'Quorum', n: 'Shade', w: 'Connecticut', o: 'Nicaragua', s: 2, notes: ['Cream', 'Cedar', 'Nuts', 'Wood'] },

  // ----- Rocky Patel (more) -----
  { b: 'Rocky Patel', n: 'The Edge Lite', w: 'Connecticut', o: 'Honduras', s: 2, notes: ['Cream', 'Cedar', 'Nuts', 'Pepper'] },
  { b: 'Rocky Patel', n: 'The Edge Sumatra', w: 'Sumatra', o: 'Honduras', s: 4, notes: ['Spice', 'Cedar', 'Earth', 'Sweet'] },
  { b: 'Rocky Patel', n: 'Olde World Reserve Corojo', w: 'Corojo', o: 'Honduras', s: 4, notes: ['Spice', 'Cedar', 'Earth', 'Pepper'] },
  { b: 'Rocky Patel', n: 'Olde World Reserve Maduro', w: 'Maduro', o: 'Honduras', s: 4, notes: ['Cocoa', 'Coffee', 'Sweet', 'Earth'] },
  { b: 'Rocky Patel', n: 'Sun Grown Maduro', w: 'Maduro', o: 'Honduras', s: 4, notes: ['Cocoa', 'Coffee', 'Spice', 'Earth'] },
  { b: 'Rocky Patel', n: 'Fifteenth Anniversary', w: 'Habano', o: 'Nicaragua', s: 3, notes: ['Cedar', 'Spice', 'Sweet', 'Leather'] },
  { b: 'Rocky Patel', n: 'Twentieth Anniversary', w: 'Habano', o: 'Honduras', s: 4, notes: ['Cedar', 'Cocoa', 'Spice', 'Leather'] },
  { b: 'Rocky Patel', n: 'Hamlet 25th Year', w: 'Habano', o: 'Honduras', s: 4, notes: ['Cedar', 'Spice', 'Sweet', 'Cocoa'] },

  // ----- RoMa Craft Tobac (NicaSueño, Nicaragua) -----
  { b: 'RoMa Craft', n: 'CroMagnon', w: 'Broadleaf', o: 'Nicaragua', fac: 'NicaSueño', s: 5, notes: ['Earth', 'Cocoa', 'Pepper', 'Leather'] },
  { b: 'RoMa Craft', n: 'Neanderthal', w: 'San Andrés', o: 'Nicaragua', fac: 'NicaSueño', s: 5, notes: ['Earth', 'Pepper', 'Cocoa', 'Coffee'] },
  { b: 'RoMa Craft', n: 'Aquitaine', w: 'Habano', o: 'Nicaragua', fac: 'NicaSueño', s: 5, notes: ['Pepper', 'Earth', 'Leather', 'Cocoa'] },
  { b: 'RoMa Craft', n: 'Intemperance EC XVIII', w: 'Habano', o: 'Nicaragua', fac: 'NicaSueño', s: 4, notes: ['Cedar', 'Spice', 'Sweet', 'Earth'] },
  { b: 'RoMa Craft', n: 'Intemperance BA XXI', w: 'Other', o: 'Nicaragua', fac: 'NicaSueño', s: 4, notes: ['Cocoa', 'Sweet', 'Earth', 'Spice'] },

  // ----- Romeo y Julieta (Dominican & Nicaraguan, more) -----
  { b: 'Romeo y Julieta', n: '1875 Nicaragua', w: 'Connecticut', bi: 'Nicaragua', f: 'Nicaragua', o: 'Nicaragua', fac: 'Plasencia Cigars', s: 2, notes: ['Cream', 'Cedar', 'Nuts', 'Pepper'], checked: true },
  { b: 'Romeo y Julieta', n: '1875 Reserve Maduro', w: 'Maduro', o: 'Dominican Republic', fac: 'Tabacalera de García', s: 3, notes: ['Cocoa', 'Sweet', 'Earth', 'Wood'] },
  { b: 'Romeo y Julieta', n: 'Reserva Real Nicaragua', w: 'Habano', bi: 'Nicaragua', f: 'Nicaragua', o: 'Nicaragua', s: 3, notes: ['Cedar', 'Spice', 'Sweet', 'Earth'] },
  { b: 'Romeo y Julieta', n: 'Romeo', w: 'Habano', o: 'Dominican Republic', fac: 'Tabacalera de García', s: 3, notes: ['Cedar', 'Spice', 'Sweet', 'Leather'] },
  { b: 'Romeo y Julieta', n: 'RyJ Nicaragua by AJ Fernandez', w: 'Habano', o: 'Nicaragua', fac: 'Tabacalera AJ Fernandez', s: 4, notes: ['Pepper', 'Cocoa', 'Earth', 'Leather'] },
  { b: 'Romeo y Julieta', n: 'Pasión', w: 'Habano', bi: 'USA', f: 'Honduras, Dominican Republic', o: 'Dominican Republic', s: 3, notes: ['Cedar', 'Sweet', 'Spice', 'Cream'], checked: true },

  // ----- Southern Draw (made by AJ Fernandez, Nicaragua) -----
  { b: 'Southern Draw', n: 'Rose of Sharon', w: 'Connecticut', bi: 'Nicaragua', f: 'Nicaragua, Dominican Republic', o: 'Nicaragua', fac: 'Tabacalera AJ Fernandez', s: 2, notes: ['Cream', 'Floral', 'Sweet', 'Cedar'], checked: true },
  { b: 'Southern Draw', n: 'Jacob\'s Ladder', w: 'Broadleaf', bi: 'Ecuador', f: 'Nicaragua', o: 'Nicaragua', fac: 'Tabacalera AJ Fernandez', s: 5, notes: ['Earth', 'Cocoa', 'Pepper', 'Sweet'], checked: true },
  { b: 'Southern Draw', n: 'Kudzu', w: 'Habano', o: 'Nicaragua', fac: 'Tabacalera AJ Fernandez', s: 4, notes: ['Cedar', 'Spice', 'Sweet', 'Earth'] },
  { b: 'Southern Draw', n: 'Firethorn', w: 'Habano', o: 'Nicaragua', fac: 'Tabacalera AJ Fernandez', s: 4, notes: ['Pepper', 'Cedar', 'Sweet', 'Leather'] },
  { b: 'Southern Draw', n: 'Cedrus', w: 'Habano', o: 'Nicaragua', fac: 'Tabacalera AJ Fernandez', s: 3, notes: ['Cedar', 'Cream', 'Sweet', 'Spice'] },

  // ----- Villiger -----
  { b: 'Villiger', n: 'La Flor de Ynclan', w: 'Habano', o: 'Dominican Republic', s: 3, notes: ['Cedar', 'Cream', 'Spice', 'Nuts'] },

  // ----- Warped -----
  { b: 'Warped', n: 'La Colmena', w: 'Other', bi: 'Ecuador', f: 'Dominican Republic, Nicaragua', o: 'USA', fac: 'El Titan de Bronze', s: 3, notes: ['Floral', 'Cream', 'Honey', 'Cedar'], checked: true },
  { b: 'Warped', n: 'Flor del Valle', w: 'Corojo', bi: 'Nicaragua', f: 'Nicaragua', o: 'Nicaragua', fac: 'Aganorsa Leaf', s: 4, notes: ['Cedar', 'Spice', 'Sweet', 'Cream'], checked: true },
  { b: 'Warped', n: 'Maestro del Tiempo', w: 'Corojo', bi: 'Nicaragua', f: 'Nicaragua', o: 'Nicaragua', fac: 'Aganorsa Leaf', s: 4, notes: ['Cedar', 'Spice', 'Earth', 'Sweet'], status: 'discontinued', checked: true },
  { b: 'Warped', n: 'Futuro', w: 'Corojo', bi: 'Nicaragua', f: 'Nicaragua', o: 'Nicaragua', fac: 'Aganorsa Leaf', s: 4, notes: ['Spice', 'Cedar', 'Earth', 'Leather'], status: 'discontinued' },

  // ----- Aging Room -----
  { b: 'Aging Room', n: 'Quattro Nicaragua', w: 'Habano', bi: 'Nicaragua', f: 'Nicaragua', o: 'Nicaragua', s: 4, notes: ['Cedar', 'Spice', 'Sweet', 'Cream'], checked: true },
  { b: 'Aging Room', n: 'Pura Cepa', w: 'Habano', bi: 'Nicaragua', f: 'Nicaragua', o: 'Nicaragua', fac: 'Plasencia Cigars', s: 4, notes: ['Pepper', 'Cedar', 'Earth', 'Sweet'], checked: true },

  // ----- Alec Bradley (more) -----
  { b: 'Alec Bradley', n: 'Black Market Estelí', w: 'Habano', o: 'Nicaragua', s: 4, notes: ['Pepper', 'Earth', 'Cedar', 'Cocoa'] },

  // ----- Arturo Fuente (more) -----
  { b: 'Arturo Fuente', n: 'Opus X Angel\'s Share', w: 'Rosado', bi: 'Dominican Republic', f: 'Dominican Republic', o: 'Dominican Republic', fac: 'Tabacalera A. Fuente', s: 4, notes: ['Cedar', 'Spice', 'Sweet', 'Leather'], status: 'limited' },
  { b: 'Arturo Fuente', n: 'Sun Grown', w: 'Other', bi: 'Dominican Republic', f: 'Dominican Republic', o: 'Dominican Republic', fac: 'Tabacalera A. Fuente', s: 3, notes: ['Cedar', 'Spice', 'Sweet', 'Earth'], checked: true },
  { b: 'Arturo Fuente', n: 'Chateau Fuente Sun Grown', w: 'Other', bi: 'Dominican Republic', f: 'Dominican Republic', o: 'Dominican Republic', fac: 'Tabacalera A. Fuente', s: 4, notes: ['Cedar', 'Spice', 'Leather', 'Sweet'], checked: true },

  // ----- Black Works Studio (Fabrica Oveja Negra, Nicaragua) -----
  { b: 'Black Works Studio', n: 'NBK', w: 'Habano', bi: 'Nicaragua', f: 'Nicaragua', o: 'Nicaragua', fac: 'Fabrica Oveja Negra', s: 4, notes: ['Cocoa', 'Earth', 'Pepper', 'Leather'], checked: true },
  { b: 'Black Works Studio', n: 'Killer Bee', w: 'Maduro', bi: 'Nicaragua', f: 'Nicaragua', o: 'Nicaragua', fac: 'Fabrica Oveja Negra', s: 4, notes: ['Cocoa', 'Sweet', 'Pepper', 'Earth'], checked: true },
  { b: 'Black Works Studio', n: 'Rorschach', w: 'Habano', bi: 'Nicaragua', f: 'Nicaragua', o: 'Nicaragua', fac: 'Fabrica Oveja Negra', s: 4, notes: ['Pepper', 'Cedar', 'Earth', 'Spice'], checked: true },
  { b: 'Black Works Studio', n: 'S&R (Serpents and Rainbows)', w: 'Sumatra', bi: 'Nicaragua', f: 'Nicaragua, Dominican Republic', o: 'Nicaragua', fac: 'Fabrica Oveja Negra', s: 4, notes: ['Spice', 'Cedar', 'Sweet', 'Earth'], checked: true },

  // ----- Camacho (more) -----
  { b: 'Camacho', n: 'Diploma', w: 'Corojo', o: 'Honduras', s: 5, notes: ['Pepper', 'Earth', 'Leather', 'Spice'] },

  // ----- Casa Turrent (Mexico) -----
  { b: 'Casa Turrent', n: '1880 Claro', w: 'San Andrés', bi: 'Mexico', f: 'Mexico', o: 'Mexico', s: 3, notes: ['Cedar', 'Sweet', 'Earth', 'Nuts'] },
  { b: 'Casa Turrent', n: '1880 Colorado', w: 'San Andrés', bi: 'Mexico', f: 'Mexico', o: 'Mexico', s: 3, notes: ['Earth', 'Sweet', 'Cedar', 'Spice'] },
  { b: 'Casa Turrent', n: '1880 Maduro', w: 'San Andrés', bi: 'Mexico', f: 'Mexico', o: 'Mexico', s: 4, notes: ['Cocoa', 'Earth', 'Coffee', 'Sweet'] },

  // ----- Cavalier Genève -----
  { b: 'Cavalier Genève', n: 'White Series', w: 'Habano', bi: 'USA (Connecticut)', f: 'Dominican Republic, Nicaragua', o: 'Honduras', s: 3, notes: ['Cedar', 'Cream', 'Spice', 'Sweet'], checked: true },
  { b: 'Cavalier Genève', n: 'Black Series II', w: 'San Andrés', o: 'Honduras', s: 4, notes: ['Cocoa', 'Earth', 'Sweet', 'Coffee'] },

  // ----- Cuesta Rey -----
  { b: 'Cuesta Rey', n: 'Centenario', w: 'Connecticut', o: 'Dominican Republic', s: 2, notes: ['Cream', 'Cedar', 'Nuts', 'Wood'] },

  // ----- Diamond Crown (more) -----
  { b: 'Diamond Crown', n: 'Maximus', w: 'Other', o: 'Dominican Republic', s: 4, notes: ['Cedar', 'Spice', 'Leather', 'Sweet'] },

  // ----- Don Diego -----
  { b: 'Don Diego', n: 'Classic', w: 'Connecticut', o: 'Dominican Republic', s: 1, notes: ['Cream', 'Cedar', 'Nuts', 'Toast'] },

  // ----- El Titan de Bronze (Miami, USA) -----
  { b: 'El Titan de Bronze', n: 'Redemption', w: 'Habano', o: 'USA', fac: 'El Titan de Bronze', s: 4, notes: ['Cedar', 'Spice', 'Cocoa', 'Leather'] },

  // ----- 601 by Espinosa (La Zona, Nicaragua) -----
  { b: '601', n: 'Red Label Habano', w: 'Habano', o: 'Nicaragua', fac: 'La Zona', s: 4, notes: ['Pepper', 'Cedar', 'Earth', 'Sweet'] },
  { b: '601', n: 'Blue Label Maduro', w: 'Maduro', o: 'Nicaragua', fac: 'La Zona', s: 4, notes: ['Cocoa', 'Coffee', 'Earth', 'Pepper'] },
  { b: '601', n: 'La Bomba', w: 'Habano', o: 'Nicaragua', fac: 'La Zona', s: 5, notes: ['Pepper', 'Earth', 'Leather', 'Spice'] },

  // ----- Flor de Copán (Honduras) -----
  { b: 'Flor de Copán', n: 'Classic', w: 'Habano', o: 'Honduras', s: 3, notes: ['Earth', 'Cedar', 'Sweet', 'Wood'] },

  // ----- La Aurora / León Jimenes (Dominican Republic) -----
  { b: 'La Aurora', n: '107', w: 'Habano', o: 'Dominican Republic', fac: 'La Aurora', s: 4, notes: ['Cedar', 'Spice', 'Leather', 'Sweet'] },
  { b: 'La Aurora', n: '1495 Series', w: 'Habano', o: 'Dominican Republic', fac: 'La Aurora', s: 3, notes: ['Cedar', 'Cream', 'Spice', 'Nuts'] },
  { b: 'La Aurora', n: 'Cameroon Selection', w: 'Cameroon', o: 'Dominican Republic', fac: 'La Aurora', s: 3, notes: ['Cedar', 'Sweet', 'Spice', 'Nuts'] },
  { b: 'León Jimenes', n: 'Classic', w: 'Connecticut', o: 'Dominican Republic', fac: 'La Aurora', s: 2, notes: ['Cream', 'Cedar', 'Nuts', 'Honey'] },

  // ----- La Galera (Dominican Republic) -----
  { b: 'La Galera', n: 'Habano', w: 'Habano', o: 'Dominican Republic', s: 3, notes: ['Cedar', 'Spice', 'Sweet', 'Earth'] },
  { b: 'La Galera', n: 'Connecticut', w: 'Connecticut', o: 'Dominican Republic', s: 2, notes: ['Cream', 'Nuts', 'Cedar', 'Toast'] },
  { b: 'La Galera', n: 'Maduro', w: 'Maduro', o: 'Dominican Republic', s: 4, notes: ['Cocoa', 'Earth', 'Sweet', 'Coffee'] },

  // ----- Perdomo (more) -----
  { b: 'Perdomo', n: 'Fresco Connecticut', w: 'Connecticut', o: 'Nicaragua', fac: 'Tabacalera Perdomo', s: 2, notes: ['Cream', 'Nuts', 'Wood', 'Cedar'] },
  { b: 'Perdomo', n: 'Fresco Sun Grown', w: 'Habano', o: 'Nicaragua', fac: 'Tabacalera Perdomo', s: 3, notes: ['Cedar', 'Spice', 'Wood', 'Earth'] },
  { b: 'Perdomo', n: 'Fresco Maduro', w: 'Maduro', o: 'Nicaragua', fac: 'Tabacalera Perdomo', s: 3, notes: ['Cocoa', 'Sweet', 'Earth', 'Wood'] },

  // ----- Quesada (Dominican Republic) -----
  { b: 'Quesada', n: 'Tributo', w: 'Habano', bi: 'Honduras', f: 'Dominican Republic, Nicaragua', o: 'Dominican Republic', s: 3, notes: ['Cedar', 'Spice', 'Cream', 'Sweet'], checked: true },
  { b: 'Quesada', n: 'Oktoberfest', w: 'San Andrés', bi: 'Dominican Republic', f: 'Dominican Republic', o: 'Dominican Republic', s: 4, notes: ['Cocoa', 'Earth', 'Sweet', 'Spice'], status: 'limited', checked: true },
  { b: 'Quesada', n: 'Q d\'Etat', w: 'Other', bi: 'Dominican Republic', f: 'Dominican Republic', o: 'Dominican Republic', s: 3, notes: ['Cedar', 'Earth', 'Spice', 'Sweet'] },

  // ----- Rocky Patel (more) -----
  { b: 'Rocky Patel', n: 'Prohibition', w: 'Broadleaf', o: 'Nicaragua', s: 4, notes: ['Cocoa', 'Earth', 'Pepper', 'Sweet'] },

  // ----- San Lotano Requiem (AJ Fernandez) -----
  { b: 'AJ Fernandez', n: 'San Lotano Requiem Habano', w: 'Habano', o: 'Nicaragua', fac: 'Tabacalera AJ Fernandez', s: 4, notes: ['Cedar', 'Spice', 'Earth', 'Sweet'] },
  { b: 'AJ Fernandez', n: 'San Lotano Requiem Maduro', w: 'Maduro', o: 'Nicaragua', fac: 'Tabacalera AJ Fernandez', s: 4, notes: ['Cocoa', 'Coffee', 'Sweet', 'Earth'] },
  { b: 'AJ Fernandez', n: 'San Lotano Requiem Connecticut', w: 'Connecticut', o: 'Nicaragua', fac: 'Tabacalera AJ Fernandez', s: 2, notes: ['Cream', 'Cedar', 'Nuts', 'Pepper'] },

  // ----- Vega Fina -----
  { b: 'Vega Fina', n: 'Nicaragua', w: 'Habano', o: 'Nicaragua', s: 4, notes: ['Pepper', 'Earth', 'Cedar', 'Leather'] },

  // ===== Cuban (Habanos S.A. — all Cuban tobacco, mostly Vuelta Abajo) =====
  // Cuban brands are listed by their best-known sizes, since each size is famous on its own.
  { b: 'Bolívar', n: 'Belicosos Finos', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 4, notes: ['Earth', 'Leather', 'Cocoa', 'Spice'] },
  { b: 'Bolívar', n: 'Royal Coronas', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 4, notes: ['Earth', 'Leather', 'Cocoa', 'Coffee'] },
  { b: 'Cohiba', n: 'Siglo II', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 3, notes: ['Cedar', 'Honey', 'Cream', 'Floral'] },
  { b: 'Cohiba', n: 'Siglo VI', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 4, notes: ['Cedar', 'Honey', 'Cream', 'Leather'] },
  { b: 'Cohiba', n: 'Robustos', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 4, notes: ['Cedar', 'Honey', 'Leather', 'Spice'] },
  { b: 'Cohiba', n: 'Behike', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 4, notes: ['Honey', 'Cedar', 'Leather', 'Cocoa'], status: 'limited' },
  { b: 'Cuaba', n: 'Exclusivos', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 3, notes: ['Cedar', 'Floral', 'Sweet', 'Earth'] },
  { b: 'Diplomáticos', n: 'No. 2', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 3, notes: ['Cedar', 'Coffee', 'Cocoa', 'Earth'] },
  { b: 'El Rey del Mundo', n: 'Choix Supreme', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 2, notes: ['Cream', 'Floral', 'Nuts', 'Wood'] },
  { b: 'H. Upmann', n: 'Magnum 54', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 3, notes: ['Cream', 'Cedar', 'Nuts', 'Wood'] },
  { b: 'H. Upmann', n: 'Half Corona', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 2, notes: ['Cream', 'Cedar', 'Nuts', 'Honey'] },
  { b: 'H. Upmann', n: 'No. 2', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 3, notes: ['Cedar', 'Cream', 'Coffee', 'Earth'] },
  { b: 'Hoyo de Monterrey', n: 'Epicure No. 2', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 2, notes: ['Cream', 'Floral', 'Cedar', 'Honey'] },
  { b: 'Hoyo de Monterrey', n: 'Epicure Especial', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 2, notes: ['Cream', 'Floral', 'Nuts', 'Honey'] },
  { b: 'Hoyo de Monterrey', n: 'Double Corona', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 2, notes: ['Cream', 'Floral', 'Wood', 'Honey'] },
  { b: 'Juan López', n: 'Selección No. 2', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 3, notes: ['Earth', 'Cedar', 'Sweet', 'Leather'] },
  { b: 'Montecristo', n: 'No. 2', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 3, notes: ['Cedar', 'Coffee', 'Cocoa', 'Spice'] },
  { b: 'Montecristo', n: 'No. 4', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 3, notes: ['Cedar', 'Coffee', 'Cocoa', 'Wood'] },
  { b: 'Montecristo', n: 'Edmundo', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 3, notes: ['Cedar', 'Coffee', 'Cocoa', 'Leather'] },
  { b: 'Montecristo', n: 'Open Eagle', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 2, notes: ['Cedar', 'Cream', 'Nuts', 'Wood'] },
  { b: 'Partagás', n: 'Serie D No. 4', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 4, notes: ['Earth', 'Leather', 'Spice', 'Cocoa'] },
  { b: 'Partagás', n: 'Serie P No. 2', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 4, notes: ['Earth', 'Leather', 'Spice', 'Coffee'] },
  { b: 'Partagás', n: 'Lusitanias', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 4, notes: ['Earth', 'Leather', 'Spice', 'Sweet'] },
  { b: 'Punch', n: 'Punch Punch', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 3, notes: ['Cedar', 'Earth', 'Sweet', 'Wood'] },
  { b: 'Punch', n: 'Double Corona', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 3, notes: ['Cedar', 'Earth', 'Sweet', 'Fruit'] },
  { b: 'Quai d\'Orsay', n: 'No. 50', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 2, notes: ['Cream', 'Floral', 'Cedar', 'Honey'] },
  { b: 'Rafael González', n: 'Perlas', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 2, notes: ['Cream', 'Floral', 'Cedar', 'Sweet'] },
  { b: 'Ramón Allones', n: 'Specially Selected', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 4, notes: ['Fruit', 'Earth', 'Cocoa', 'Leather'] },
  { b: 'Ramón Allones', n: 'Small Club Coronas', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 3, notes: ['Fruit', 'Earth', 'Sweet', 'Cedar'] },
  { b: 'Romeo y Julieta', n: 'Churchill', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 3, notes: ['Cedar', 'Floral', 'Cream', 'Wood'] },
  { b: 'Romeo y Julieta', n: 'Short Churchill', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 3, notes: ['Cedar', 'Floral', 'Sweet', 'Wood'] },
  { b: 'Romeo y Julieta', n: 'Wide Churchills', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 3, notes: ['Cedar', 'Floral', 'Cocoa', 'Cream'] },
  { b: 'San Cristóbal de la Habana', n: 'La Fuerza', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 3, notes: ['Earth', 'Cedar', 'Spice', 'Sweet'] },
  { b: 'Trinidad', n: 'Fundadores', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 3, notes: ['Floral', 'Honey', 'Cedar', 'Cream'] },
  { b: 'Trinidad', n: 'Reyes', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 3, notes: ['Floral', 'Honey', 'Cedar', 'Spice'] },
  { b: 'Vegas Robaina', n: 'Famosos', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 4, notes: ['Earth', 'Leather', 'Spice', 'Cedar'] },

  // ----- More Cuban sizes -----
  { b: 'Bolívar', n: 'Coronas Gigantes', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 4, notes: ['Earth', 'Leather', 'Cocoa', 'Coffee'] },
  { b: 'Bolívar', n: 'Petit Belicosos', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 4, notes: ['Earth', 'Leather', 'Cocoa', 'Spice'] },
  { b: 'Bolívar', n: 'Coronas Junior', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 4, notes: ['Earth', 'Leather', 'Spice', 'Coffee'] },
  { b: 'Cohiba', n: 'Siglo I', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 3, notes: ['Cedar', 'Honey', 'Cream', 'Floral'] },
  { b: 'Cohiba', n: 'Siglo III', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 3, notes: ['Cedar', 'Honey', 'Cream', 'Nuts'] },
  { b: 'Cohiba', n: 'Siglo IV', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 3, notes: ['Cedar', 'Honey', 'Cream', 'Leather'] },
  { b: 'Cohiba', n: 'Siglo V', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 3, notes: ['Cedar', 'Honey', 'Cream', 'Wood'] },
  { b: 'Cohiba', n: 'Medio Siglo', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 3, notes: ['Cedar', 'Honey', 'Leather', 'Cream'] },
  { b: 'Cohiba', n: 'Esplendidos', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 4, notes: ['Cedar', 'Honey', 'Leather', 'Spice'] },
  { b: 'Cohiba', n: 'Lanceros', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 4, notes: ['Cedar', 'Honey', 'Spice', 'Leather'] },
  { b: 'Cohiba', n: 'Coronas Especiales', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 4, notes: ['Cedar', 'Honey', 'Spice', 'Cream'] },
  { b: 'Cohiba', n: 'Panetelas', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 3, notes: ['Cedar', 'Honey', 'Cream', 'Floral'] },
  { b: 'Cuaba', n: 'Divinos', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 3, notes: ['Cedar', 'Floral', 'Sweet', 'Earth'] },
  { b: 'Cuaba', n: 'Distinguidos', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 3, notes: ['Cedar', 'Floral', 'Sweet', 'Spice'] },
  { b: 'Diplomáticos', n: 'No. 4', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 3, notes: ['Cedar', 'Coffee', 'Cocoa', 'Wood'] },
  { b: 'El Rey del Mundo', n: 'Demi Tasse', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 2, notes: ['Cream', 'Floral', 'Nuts', 'Sweet'] },
  { b: 'Fonseca', n: 'Cosacos', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 2, notes: ['Cream', 'Cedar', 'Nuts', 'Floral'] },
  { b: 'H. Upmann', n: 'Connossieur No. 1', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 3, notes: ['Cream', 'Cedar', 'Nuts', 'Coffee'] },
  { b: 'H. Upmann', n: 'Connossieur A', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 3, notes: ['Cream', 'Cedar', 'Nuts', 'Wood'] },
  { b: 'H. Upmann', n: 'Magnum 50', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 3, notes: ['Cream', 'Cedar', 'Nuts', 'Honey'] },
  { b: 'H. Upmann', n: 'Magnum 46', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 3, notes: ['Cream', 'Cedar', 'Nuts', 'Wood'] },
  { b: 'H. Upmann', n: 'Royal Robusto', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 3, notes: ['Cedar', 'Cream', 'Spice', 'Nuts'] },
  { b: 'H. Upmann', n: 'Sir Winston', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 3, notes: ['Cedar', 'Cream', 'Nuts', 'Leather'] },
  { b: 'Hoyo de Monterrey', n: 'Petit Robustos', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 2, notes: ['Cream', 'Floral', 'Cedar', 'Nuts'] },
  { b: 'Hoyo de Monterrey', n: 'Epicure No. 1', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 2, notes: ['Cream', 'Floral', 'Honey', 'Cedar'] },
  { b: 'Hoyo de Monterrey', n: 'Le Hoyo du Maire', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 2, notes: ['Cream', 'Floral', 'Nuts', 'Wood'] },
  { b: 'Hoyo de Monterrey', n: 'Le Hoyo de San Juan', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 3, notes: ['Cream', 'Cedar', 'Floral', 'Earth'] },
  { b: 'José L. Piedra', n: 'Cazadores', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 3, notes: ['Earth', 'Wood', 'Spice', 'Leather'] },
  { b: 'Juan López', n: 'Selección No. 1', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 3, notes: ['Earth', 'Cedar', 'Sweet', 'Leather'] },
  { b: 'La Gloria Cubana', n: 'Médaille d\'Or No. 2', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 3, notes: ['Cedar', 'Nuts', 'Spice', 'Cream'] },
  { b: 'Montecristo', n: 'No. 1', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 3, notes: ['Cedar', 'Coffee', 'Cocoa', 'Wood'] },
  { b: 'Montecristo', n: 'No. 3', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 3, notes: ['Cedar', 'Coffee', 'Cocoa', 'Spice'] },
  { b: 'Montecristo', n: 'Petit No. 2', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 3, notes: ['Cedar', 'Coffee', 'Cocoa', 'Spice'] },
  { b: 'Montecristo', n: 'Petit Edmundo', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 3, notes: ['Cedar', 'Coffee', 'Cocoa', 'Leather'] },
  { b: 'Montecristo', n: 'Double Edmundo', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 3, notes: ['Cedar', 'Coffee', 'Cocoa', 'Leather'] },
  { b: 'Montecristo', n: 'Media Corona', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 3, notes: ['Cedar', 'Coffee', 'Cocoa', 'Wood'] },
  { b: 'Montecristo', n: 'Open Master', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 2, notes: ['Cedar', 'Cream', 'Nuts', 'Coffee'] },
  { b: 'Montecristo', n: 'Línea 1935 Leyenda', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 4, notes: ['Cedar', 'Coffee', 'Cocoa', 'Leather'] },
  { b: 'Partagás', n: 'Serie D No. 5', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 4, notes: ['Earth', 'Leather', 'Spice', 'Cocoa'] },
  { b: 'Partagás', n: 'Serie D No. 6', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 4, notes: ['Earth', 'Leather', 'Spice', 'Sweet'] },
  { b: 'Partagás', n: 'Serie E No. 2', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 4, notes: ['Earth', 'Leather', 'Spice', 'Coffee'] },
  { b: 'Partagás', n: 'Shorts', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 4, notes: ['Earth', 'Leather', 'Spice', 'Cocoa'] },
  { b: 'Partagás', n: 'Mille Fleurs', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 3, notes: ['Earth', 'Spice', 'Cedar', 'Leather'] },
  { b: 'Partagás', n: 'Maduro No. 1', w: 'Maduro', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 4, notes: ['Cocoa', 'Earth', 'Coffee', 'Sweet'] },
  { b: 'Por Larrañaga', n: 'Panetelas', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 2, notes: ['Sweet', 'Cedar', 'Honey', 'Wood'] },
  { b: 'Por Larrañaga', n: 'Petit Coronas', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 2, notes: ['Sweet', 'Cedar', 'Honey', 'Fruit'] },
  { b: 'Punch', n: 'Short de Punch', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 3, notes: ['Cedar', 'Earth', 'Sweet', 'Fruit'] },
  { b: 'Punch', n: 'Coronations', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 2, notes: ['Cedar', 'Sweet', 'Wood', 'Earth'] },
  { b: 'Quai d\'Orsay', n: 'No. 54', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 2, notes: ['Cream', 'Floral', 'Cedar', 'Honey'] },
  { b: 'Quintero', n: 'Favoritos', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 3, notes: ['Earth', 'Wood', 'Cedar', 'Nuts'] },
  { b: 'Ramón Allones', n: 'Gigantes', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 4, notes: ['Fruit', 'Earth', 'Cocoa', 'Leather'] },
  { b: 'Romeo y Julieta', n: 'Petit Churchills', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 3, notes: ['Cedar', 'Floral', 'Cream', 'Sweet'] },
  { b: 'Romeo y Julieta', n: 'Exhibición No. 4', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 3, notes: ['Cedar', 'Floral', 'Cocoa', 'Wood'] },
  { b: 'Romeo y Julieta', n: 'Mille Fleurs', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 2, notes: ['Cedar', 'Floral', 'Cream', 'Wood'] },
  { b: 'Romeo y Julieta', n: 'Belicosos', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 3, notes: ['Cedar', 'Floral', 'Cocoa', 'Cream'] },
  { b: 'Romeo y Julieta', n: 'Petit Royales', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 3, notes: ['Cedar', 'Floral', 'Sweet', 'Cream'] },
  { b: 'Romeo y Julieta', n: 'Cedros de Luxe No. 2', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 3, notes: ['Cedar', 'Floral', 'Wood', 'Cream'] },
  { b: 'Saint Luis Rey', n: 'Regios', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 4, notes: ['Earth', 'Cocoa', 'Spice', 'Leather'] },
  { b: 'Saint Luis Rey', n: 'Série A', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 4, notes: ['Earth', 'Cocoa', 'Spice', 'Cedar'] },
  { b: 'San Cristóbal de la Habana', n: 'El Morro', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 3, notes: ['Earth', 'Cedar', 'Spice', 'Sweet'] },
  { b: 'San Cristóbal de la Habana', n: 'La Punta', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 3, notes: ['Earth', 'Cedar', 'Sweet', 'Wood'] },
  { b: 'Sancho Panza', n: 'Belicosos', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 2, notes: ['Cream', 'Cedar', 'Earth', 'Wood'] },
  { b: 'Sancho Panza', n: 'Non Plus', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 2, notes: ['Cream', 'Cedar', 'Wood', 'Nuts'] },
  { b: 'Trinidad', n: 'Vigía', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 3, notes: ['Floral', 'Honey', 'Cedar', 'Spice'] },
  { b: 'Trinidad', n: 'Coloniales', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 3, notes: ['Floral', 'Honey', 'Cedar', 'Cream'] },
  { b: 'Trinidad', n: 'Topes', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 3, notes: ['Floral', 'Honey', 'Cedar', 'Earth'] },
  { b: 'Trinidad', n: 'Media Luna', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 3, notes: ['Floral', 'Honey', 'Cream', 'Cedar'] },
  { b: 'Vegas Robaina', n: 'Únicos', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 4, notes: ['Earth', 'Leather', 'Spice', 'Cocoa'] },
  { b: 'Vegueros', n: 'Entretiempos', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 3, notes: ['Earth', 'Sweet', 'Cedar', 'Spice'] },
  { b: 'Vegueros', n: 'Tapados', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 3, notes: ['Earth', 'Sweet', 'Cedar', 'Wood'] },
  { b: 'Vegueros', n: 'Mañanitas', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 3, notes: ['Earth', 'Sweet', 'Spice', 'Cedar'] },
  { b: 'Bolívar', n: 'Petit Coronas', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 4, notes: ['Earth', 'Leather', 'Cocoa', 'Spice'] },
  { b: 'Cohiba', n: 'Maduro 5 Genios', w: 'Maduro', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 4, notes: ['Cocoa', 'Coffee', 'Honey', 'Earth'] },
  { b: 'Cohiba', n: 'Maduro 5 Mágicos', w: 'Maduro', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 4, notes: ['Cocoa', 'Coffee', 'Honey', 'Sweet'] },
  { b: 'Cohiba', n: 'Maduro 5 Secretos', w: 'Maduro', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 4, notes: ['Cocoa', 'Coffee', 'Sweet', 'Earth'] },
  { b: 'Fonseca', n: 'Delicias', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 2, notes: ['Cream', 'Cedar', 'Floral', 'Nuts'] },
  { b: 'H. Upmann', n: 'Coronas Major', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 2, notes: ['Cream', 'Cedar', 'Nuts', 'Wood'] },
  { b: 'Hoyo de Monterrey', n: 'Epicure de Luxe', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 2, notes: ['Cream', 'Floral', 'Honey', 'Nuts'] },
  { b: 'José L. Piedra', n: 'Petit Cetros', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 3, notes: ['Earth', 'Wood', 'Spice', 'Cedar'] },
  { b: 'Juan López', n: 'Petit Coronas', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 3, notes: ['Earth', 'Cedar', 'Sweet', 'Spice'] },
  { b: 'Montecristo', n: 'No. 5', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 3, notes: ['Cedar', 'Coffee', 'Cocoa', 'Wood'] },
  { b: 'Montecristo', n: 'Línea 1935 Maltés', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 4, notes: ['Cedar', 'Coffee', 'Cocoa', 'Spice'] },
  { b: 'Montecristo', n: 'Línea 1935 Dumas', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 4, notes: ['Cedar', 'Coffee', 'Leather', 'Cocoa'] },
  { b: 'Partagás', n: 'Presidentes', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 4, notes: ['Earth', 'Leather', 'Spice', 'Cocoa'] },
  { b: 'Punch', n: 'Royal Selection No. 12', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 3, notes: ['Cedar', 'Earth', 'Sweet', 'Wood'] },
  { b: 'Punch', n: 'Petit Coronations', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 2, notes: ['Cedar', 'Sweet', 'Wood', 'Earth'] },
  { b: 'Quai d\'Orsay', n: 'No. 52', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 2, notes: ['Cream', 'Floral', 'Cedar', 'Honey'] },
  { b: 'Quai d\'Orsay', n: 'Senadores', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 2, notes: ['Cream', 'Floral', 'Nuts', 'Honey'] },
  { b: 'Quintero', n: 'Brevas', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 3, notes: ['Earth', 'Wood', 'Cedar', 'Sweet'] },
  { b: 'Rafael González', n: 'Petit Coronas', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 2, notes: ['Cream', 'Floral', 'Cedar', 'Sweet'] },
  { b: 'Romeo y Julieta', n: 'Romeo No. 1', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 2, notes: ['Cedar', 'Floral', 'Cream', 'Wood'] },
  { b: 'Romeo y Julieta', n: 'Romeo No. 2', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 2, notes: ['Cedar', 'Floral', 'Cream', 'Sweet'] },
  { b: 'Trinidad', n: 'Esmeralda', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 3, notes: ['Floral', 'Honey', 'Cedar', 'Spice'] },
  { b: 'Vegas Robaina', n: 'Don Alejandro', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 4, notes: ['Earth', 'Leather', 'Spice', 'Cedar'] },
  { b: 'Romeo y Julieta', n: 'Petit Coronas', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 3, notes: ['Cedar', 'Floral', 'Cream', 'Wood'] },
  { b: 'H. Upmann', n: 'Petit Coronas', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 2, notes: ['Cream', 'Cedar', 'Nuts', 'Honey'] },
  { b: 'Partagás', n: 'Petit Coronas Especiales', w: 'Habano', bi: 'Cuba', f: 'Cuba', o: 'Cuba', s: 4, notes: ['Earth', 'Leather', 'Spice', 'Cocoa'] },
];
