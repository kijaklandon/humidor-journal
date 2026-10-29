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
];
