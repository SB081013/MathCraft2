// Adaptive ACT Math Engine + Diagnostic Gap Detector + Step-by-Step Basics Tutor
window.MathCraft = window.MathCraft || {};

window.MathCraft.MathEngine = (function () {
  // 6 Official ACT Math Domains
  const DOMAINS = {
    number: {
      id: 'number',
      name: 'Pre-Algebra & Number Sense',
      short: 'Pre-Algebra',
      actWeight: 0.16,
      defaultGap: 'percent_part_whole'
    },
    algebra1: {
      id: 'algebra1',
      name: 'Elementary Algebra',
      short: 'Algebra 1',
      actWeight: 0.20,
      defaultGap: 'inverse_operations'
    },
    algebra2: {
      id: 'algebra2',
      name: 'Intermediate Algebra & Functions',
      short: 'Algebra 2',
      actWeight: 0.18,
      defaultGap: 'quad_factoring'
    },
    coord_geo: {
      id: 'coord_geo',
      name: 'Coordinate Geometry',
      short: 'Coord Geometry',
      actWeight: 0.16,
      defaultGap: 'slope_formula'
    },
    plane_geo: {
      id: 'plane_geo',
      name: 'Plane Geometry',
      short: 'Plane Geometry',
      actWeight: 0.18,
      defaultGap: 'triangle_area_angles'
    },
    trig_stats: {
      id: 'trig_stats',
      name: 'Trigonometry, Prob & Stats',
      short: 'Trig & Stats',
      actWeight: 0.12,
      defaultGap: 'soh_cah_toa'
    }
  };

  // Structured Basics Lessons & Gap Remediation Library
  // Every misconception tag maps directly to one of these interactive mini-lessons!
  const LESSONS = {
    percent_part_whole: {
      id: 'percent_part_whole',
      domain: 'number',
      title: 'Percents, Ratios & Percent Change',
      summary: 'A percent just means "out of 100". Convert percentages to decimals by moving the decimal point 2 places left (e.g., 25% = 0.25), then multiply by the whole.',
      formula: 'Part = (Percent / 100) × Whole   |   % Change = (New − Old) / Old × 100%',
      actTip: 'ACT Favorite Trap: Percent change ALWAYS divides by the ORIGINAL (Old) value—never the new value! Also, a 20% discount means you PAY 80% (multiply by 0.80 in one step).',
      exampleProblem: 'A \$40 pickaxe is on sale for 25% off. What is the sale price?',
      steps: [
        'Step 1: Convert 25% to a decimal → 0.25.',
        'Step 2: Find the discount amount: 0.25 × 40 = \$10.',
        'Step 3: Subtract the discount from the original price: 40 − 10 = \$30. (Shortcut: 0.75 × 40 = \$30!)'
      ],
      check: {
        prompt: 'Quick Check: What is 20% of 50?',
        choices: ['10', '20', '25', '5'],
        answer: '10',
        explanation: '20% = 0.20, and 0.20 × 50 = 10.'
      }
    },
    exponents_roots: {
      id: 'exponents_roots',
      domain: 'number',
      title: 'Exponent Rules & Order of Operations (PEMDAS)',
      summary: 'When multiplying matching bases, ADD exponents. When raising a power to a power, MULTIPLY exponents. Always evaluate Parentheses and Exponents before Multiply/Divide and Add/Subtract.',
      formula: 'xᵃ · xᵇ = xᵃ⁺ᵇ   |   (xᵃ)ᵇ = xᵃ·ᵇ   |   x⁰ = 1',
      actTip: 'Watch negative signs! (-3)² = +9 because the negative is inside parentheses, while -3² = -9 because the exponent applies only to 3.',
      exampleProblem: 'Simplify: (x³ · x⁴) / x²',
      steps: [
        'Step 1: Multiply the numerator by adding exponents: x³ · x⁴ = x³⁺⁴ = x⁷.',
        'Step 2: Divide by subtracting exponents: x⁷ / x² = x⁷⁻² = x⁵.'
      ],
      check: {
        prompt: 'Quick Check: Simplify 2³ × 2²',
        choices: ['2⁵ (32)', '2⁶ (64)', '4⁵ (1024)', '2¹ (2)'],
        answer: '2⁵ (32)',
        explanation: 'Same base (2), multiplying → add exponents: 3 + 2 = 5, so 2⁵ = 32.'
      }
    },
    inverse_operations: {
      id: 'inverse_operations',
      domain: 'algebra1',
      title: 'Solving Linear Equations (Undo in Reverse!)',
      summary: 'To isolate x, peel away operations from the outside in using INVERSE (opposite) operations: undo + with −, undo − with +, undo × with ÷, and do the exact same thing to BOTH sides.',
      formula: 'If ax + b = c  →  First subtract b: ax = c − b  →  Then divide by a: x = (c − b) / a',
      actTip: 'ACT Speed Hack: Plug your answer back into the original equation in 3 seconds to be 100% sure you didn\'t drop a negative sign!',
      exampleProblem: 'Solve for x: 3x − 7 = 14',
      steps: [
        'Step 1: Undo "− 7" by ADDING 7 to both sides → 3x = 14 + 7 = 21.',
        'Step 2: Undo "× 3" by DIVIDING both sides by 3 → x = 21 / 3 = 7.',
        'Step 3: Quick check: 3(7) − 7 = 21 − 7 = 14 ✓'
      ],
      check: {
        prompt: 'Quick Check: Solve 4x + 5 = 21',
        choices: ['x = 4', 'x = 6.5', 'x = 16', 'x = 5'],
        answer: 'x = 4',
        explanation: 'Subtract 5 → 4x = 16, then divide by 4 → x = 4.'
      }
    },
    distributive_negatives: {
      id: 'distributive_negatives',
      domain: 'algebra1',
      title: 'Distributive Property & Combining Like Terms',
      summary: 'Multiply the outside number by EVERY term inside the parentheses—don\'t forget the second term, and watch negative signs carefully! Then combine like terms (x\'s with x\'s, numbers with numbers).',
      formula: 'a(b + c) = ab + ac   |   −(x − 4) = −x + 4',
      actTip: 'A minus sign in front of parentheses flips EVERY sign inside: −(2x − 5) = −2x + 5. This is one of the #1 ACT algebra traps!',
      exampleProblem: 'Solve: 2(x − 3) = 10',
      steps: [
        'Step 1: Distribute 2 to BOTH x and −3 → 2x − 6 = 10.',
        'Step 2: Add 6 to both sides → 2x = 16.',
        'Step 3: Divide by 2 → x = 8.'
      ],
      check: {
        prompt: 'Quick Check: Expand 3(x − 4)',
        choices: ['3x − 12', '3x − 4', '3x + 12', 'x − 12'],
        answer: '3x − 12',
        explanation: 'Multiply 3 by x (3x) AND 3 by −4 (−12) to get 3x − 12.'
      }
    },
    systems_equations: {
      id: 'systems_equations',
      domain: 'algebra1',
      title: 'Systems of Linear Equations (Elimination & Substitution)',
      summary: 'When you have two equations with x and y, either ADD/SUBTRACT the equations so one variable cancels out (Elimination), or plug one equation into the other (Substitution).',
      formula: 'Stack like terms → Eliminate one variable → Solve → Plug back in for the other',
      actTip: 'Read what the ACT asks for! Sometimes it asks for x + y directly (just add the two equations!) instead of solving for x and y separately.',
      exampleProblem: 'If x + y = 10 and x − y = 4, find x.',
      steps: [
        'Step 1: Notice +y and −y are opposites! Add the two equations straight down.',
        'Step 2: (x + x) + (y − y) = 10 + 4  →  2x = 14.',
        'Step 3: Divide by 2 → x = 7 (and y = 3).'
      ],
      check: {
        prompt: 'Quick Check: If x + y = 12 and x − y = 2, what is x?',
        choices: ['7', '5', '10', '14'],
        answer: '7',
        explanation: 'Add the equations: 2x = 14 → x = 7.'
      }
    },
    function_notation: {
      id: 'function_notation',
      domain: 'algebra2',
      title: 'Function Notation f(x) & Composition',
      summary: 'f(x) is NOT multiplication! It is a machine: whatever sits inside the parentheses replaces EVERY x in the formula.',
      formula: 'If f(x) = 2x + 3, then f(5) = 2(5) + 3 = 13',
      actTip: 'For nested functions like f(g(2)), always work from the INSIDE OUT: compute g(2) first, then plug that result into f.',
      exampleProblem: 'If f(x) = x² − 3x + 1, find f(4).',
      steps: [
        'Step 1: Replace every x with (4): f(4) = (4)² − 3(4) + 1.',
        'Step 2: Compute powers & products: 16 − 12 + 1.',
        'Step 3: Simplify left to right: 4 + 1 = 5.'
      ],
      check: {
        prompt: 'Quick Check: If f(x) = 3x − 2, what is f(5)?',
        choices: ['13', '15', '17', '9'],
        answer: '13',
        explanation: 'Replace x with 5: 3(5) − 2 = 15 − 2 = 13.'
      }
    },
    quad_factoring: {
      id: 'quad_factoring',
      domain: 'algebra2',
      title: 'Factoring Quadratics & Finding Roots',
      summary: 'To factor x² + bx + c = 0, find two numbers that MULTIPLY to c and ADD to b. Then flip their signs to get the solutions (roots)!',
      formula: 'x² + bx + c = (x + p)(x + q) = 0  →  roots are x = −p and x = −q',
      actTip: 'ACT Shortcut: The SUM of the roots of ax² + bx + c = 0 is ALWAYS −b/a, and the PRODUCT is c/a. Don\'t forget to flip the sign when setting (x − 5) = 0 → x = +5!',
      exampleProblem: 'Find the positive solution to x² − 5x + 6 = 0.',
      steps: [
        'Step 1: Find two numbers that multiply to +6 and add to −5 → −2 and −3.',
        'Step 2: Write factored form: (x − 2)(x − 3) = 0.',
        'Step 3: Set each factor to 0: x = 2 or x = 3.'
      ],
      check: {
        prompt: 'Quick Check: What are the roots of (x − 4)(x + 2) = 0?',
        choices: ['4 and −2', '−4 and 2', '4 and 2', '−4 and −2'],
        answer: '4 and −2',
        explanation: 'Set x − 4 = 0 → x = 4, and x + 2 = 0 → x = −2.'
      }
    },
    slope_formula: {
      id: 'slope_formula',
      domain: 'coord_geo',
      title: 'Slope (Rise Over Run) & y = mx + b',
      summary: 'Slope measures steepness: how much Y changes (rise) divided by how much X changes (run). Always put Y on top and subtract points in the SAME order!',
      formula: 'm = (y₂ − y₁) / (x₂ − x₁)   |   y = mx + b (m = slope, b = y-intercept)',
      actTip: 'Two big ACT rules: PARALLEL lines have the EXACT SAME slope (m₁ = m₂). PERPENDICULAR lines have NEGATIVE RECIPROCAL slopes (flip the fraction & flip the sign, e.g., 2/3 → −3/2).',
      exampleProblem: 'Find the slope between (2, 5) and (6, 13).',
      steps: [
        'Step 1: Find the rise (change in y): y₂ − y₁ = 13 − 5 = 8.',
        'Step 2: Find the run (change in x): x₂ − x₁ = 6 − 2 = 4.',
        'Step 3: Divide rise by run: m = 8 / 4 = 2.'
      ],
      check: {
        prompt: 'Quick Check: What is the slope between (1, 3) and (4, 12)?',
        choices: ['3', '1/3', '9', '−3'],
        answer: '3',
        explanation: 'Rise = 12 − 3 = 9; Run = 4 − 1 = 3; Slope = 9 / 3 = 3.'
      }
    },
    distance_midpoint: {
      id: 'distance_midpoint',
      domain: 'coord_geo',
      title: 'Midpoint & Distance Formulas',
      summary: 'The MIDPOINT is just the average of the x\'s and average of the y\'s. The DISTANCE formula is just the Pythagorean theorem on the coordinate grid!',
      formula: 'Midpoint = ((x₁+x₂)/2, (y₁+y₂)/2)   |   d = √[(x₂−x₁)² + (y₂−y₁)²]',
      actTip: 'ACT loves 3-4-5 and 6-8-10 right triangles hidden in distance questions! Check Δx and Δy first—if they are 3 and 4, the distance is instantly 5.',
      exampleProblem: 'Find the distance between (1, 2) and (4, 6).',
      steps: [
        'Step 1: Find Δx = 4 − 1 = 3 and Δy = 6 − 2 = 4.',
        'Step 2: Square and add: 3² + 4² = 9 + 16 = 25.',
        'Step 3: Take the square root: √25 = 5.'
      ],
      check: {
        prompt: 'Quick Check: What is the midpoint of (2, 4) and (8, 10)?',
        choices: ['(5, 7)', '(6, 6)', '(10, 14)', '(3, 3)'],
        answer: '(5, 7)',
        explanation: 'Average x: (2+8)/2 = 5. Average y: (4+10)/2 = 7 → (5, 7).'
      }
    },
    triangle_area_angles: {
      id: 'triangle_area_angles',
      domain: 'plane_geo',
      title: 'Triangles: Angles, Area & Pythagorean Theorem',
      summary: 'Every triangle\'s 3 interior angles add to 180°. Its area is HALF of base × height. In a right triangle, the two legs squared equal the hypotenuse squared (a² + b² = c²).',
      formula: 'A + B + C = 180°   |   Area = ½ · b · h   |   a² + b² = c²',
      actTip: 'Memorize ACT Pythagorean Triples to save 30+ seconds: (3,4,5), (5,12,13), (6,8,10), (8,15,17). And NEVER forget the ½ in triangle area!',
      exampleProblem: 'Find the area of a triangle with base 10 and height 6.',
      steps: [
        'Step 1: Recall triangle area = ½ × base × height (half a rectangle!).',
        'Step 2: Multiply base × height = 10 × 6 = 60.',
        'Step 3: Divide by 2 → 60 / 2 = 30.'
      ],
      check: {
        prompt: 'Quick Check: A right triangle has legs 6 and 8. What is the hypotenuse?',
        choices: ['10', '14', '48', '12'],
        answer: '10',
        explanation: '6² + 8² = 36 + 64 = 100, and √100 = 10 (a 6-8-10 triple!).'
      }
    },
    circles_area_circ: {
      id: 'circles_area_circ',
      domain: 'plane_geo',
      title: 'Circles: Radius, Diameter, Area & Circumference',
      summary: 'The diameter (d) goes all the way across; the radius (r) is HALF the diameter. Area uses r² (square units), while Circumference (perimeter) uses 2πr or πd.',
      formula: 'r = d / 2   |   Area = πr²   |   Circumference = 2πr = πd',
      actTip: 'ACT Trap: They love giving you the DIAMETER and asking for Area! Always cut the diameter in half FIRST to get r, then square it.',
      exampleProblem: 'A circle has diameter 10. What is its area?',
      steps: [
        'Step 1: Find the radius first: r = diameter / 2 = 10 / 2 = 5.',
        'Step 2: Plug into Area = πr² = π(5)² = 25π.'
      ],
      check: {
        prompt: 'Quick Check: What is the circumference of a circle with radius 6?',
        choices: ['12π', '36π', '6π', '18π'],
        answer: '12π',
        explanation: 'Circumference = 2πr = 2 · π · 6 = 12π.'
      }
    },
    soh_cah_toa: {
      id: 'soh_cah_toa',
      domain: 'trig_stats',
      title: 'Right-Triangle Trigonometry (SOH-CAH-TOA)',
      summary: 'Stand at angle θ in a right triangle. The Hypotenuse is always across from the 90° box. Opposite is across from θ. Adjacent touches θ.',
      formula: 'sin(θ) = Opp / Hyp   |   cos(θ) = Adj / Hyp   |   tan(θ) = Opp / Adj',
      actTip: 'Memory trick: SOH-CAH-TOA! Also remember sin²(θ) + cos²(θ) = 1, and 180° = π radians (to convert degrees → radians, multiply by π/180).',
      exampleProblem: 'In a 3-4-5 right triangle, if Opposite = 3 and Adjacent = 4, find sin(θ) and tan(θ).',
      steps: [
        'Step 1: Identify sides: Opposite = 3, Adjacent = 4, Hypotenuse = 5.',
        'Step 2: SOH → sin(θ) = Opposite / Hypotenuse = 3/5.',
        'Step 3: TOA → tan(θ) = Opposite / Adjacent = 3/4.'
      ],
      check: {
        prompt: 'Quick Check: In a right triangle with Opp = 5, Adj = 12, Hyp = 13, what is cos(θ)?',
        choices: ['12/13', '5/13', '5/12', '13/12'],
        answer: '12/13',
        explanation: 'CAH: cos(θ) = Adjacent / Hypotenuse = 12/13.'
      }
    },
    probability_stats: {
      id: 'probability_stats',
      domain: 'trig_stats',
      title: 'Probability, Mean, Median & Counting',
      summary: 'Probability is (Favorable outcomes) ÷ (Total outcomes). For independent events ("A AND B"), MULTIPLY their probabilities. For Median, SORT the numbers first and pick the middle!',
      formula: 'P(A) = favorable / total   |   P(A and B) = P(A) × P(B)   |   Mean = Sum / Count',
      actTip: 'ACT Average Shortcut: Sum = Average × Count! If 4 tests average 85, their sum is 4 × 85 = 340. This solves "what score do you need on the next test?" in seconds!',
      exampleProblem: 'A bag has 3 red and 5 blue gems. What is the probability of drawing a red gem?',
      steps: [
        'Step 1: Find total gems: 3 + 5 = 8.',
        'Step 2: Divide favorable (red = 3) by total (8) → 3/8.'
      ],
      check: {
        prompt: 'Quick Check: What is the median of {12, 4, 9, 20, 7}?',
        choices: ['9', '12', '10.4', '7'],
        answer: '9',
        explanation: 'Sort first: 4, 7, 9, 12, 20. The middle value is 9!'
      }
    },
    logarithms: {
      id: 'logarithms',
      domain: 'algebra2',
      title: 'Logarithms & Exponential Conversion',
      summary: 'A logarithm is just asking: "What EXPONENT do I put on the base to get the number inside?" log_b(x) = y means the exact same thing as b^y = x!',
      formula: 'log_b(x) = y  ⇔  b^y = x   |   log(ab) = log(a) + log(b)   |   log(a/b) = log(a) − log(b)',
      actTip: 'ACT Loop Trick: Start at the base b, swing across the equals sign to y as the exponent, and equal the inside x: b^y = x! Also remember log(1) = 0 for ANY base.',
      exampleProblem: 'Evaluate: log₂(32)',
      steps: [
        'Step 1: Rewrite log₂(32) = y in exponential form → 2^y = 32.',
        'Step 2: Count powers of 2: 2¹=2, 2²=4, 2³=8, 2⁴=16, 2⁵=32.',
        'Step 3: Since 2⁵ = 32, the answer is y = 5!'
      ],
      check: {
        prompt: 'Quick Check: What is log₃(27)?',
        choices: ['3', '9', '81', '4'],
        answer: '3',
        explanation: 'Ask: 3 to what power equals 27? Since 3³ = 27, log₃(27) = 3!'
      }
    },
    complex_numbers: {
      id: 'complex_numbers',
      domain: 'algebra2',
      title: 'Complex & Imaginary Numbers (i)',
      summary: 'The imaginary unit i is defined as √(−1), which means i² = −1! Treat i like a regular variable x when adding or FOILing, then swap every i² for −1.',
      formula: 'i = √(−1)   |   i² = −1   |   i³ = −i   |   i⁴ = 1   (repeats every 4!)',
      actTip: 'For high powers like i³⁷, divide the exponent by 4 and look ONLY at the REMAINDER: rem 1 → i, rem 2 → −1, rem 3 → −i, rem 0 → 1!',
      exampleProblem: 'Simplify: (2 + 3i)(4 − i)',
      steps: [
        'Step 1: FOIL just like binomials: 2(4) + 2(−i) + 3i(4) + 3i(−i) = 8 − 2i + 12i − 3i².',
        'Step 2: Combine middle terms: 8 + 10i − 3i².',
        'Step 3: Replace i² with −1: 8 + 10i − 3(−1) = 8 + 10i + 3 = 11 + 10i!'
      ],
      check: {
        prompt: 'Quick Check: What is i⁶ equal to?',
        choices: ['−1', '1', 'i', '−i'],
        answer: '−1',
        explanation: 'Divide 6 by 4 → remainder 2, so i⁶ = i² = −1!'
      }
    },
    matrices: {
      id: 'matrices',
      domain: 'trig_stats',
      title: 'Matrices: Operations & 2×2 Determinants',
      summary: 'To add or subtract matrices, match positions entry-by-entry. For a 2×2 matrix [[a, b], [c, d]], the determinant is the main diagonal product MINUS the other diagonal product!',
      formula: 'det [[a, b], [c, d]] = ad − bc   |   Multiply A(m×n) · B(n×p) → size (m×p)',
      actTip: 'ACT Favorite: Draw an "X" on a 2×2 matrix for its determinant: (top-left × bottom-right) MINUS (top-right × bottom-left). Watch negative signs when subtracting bc!',
      exampleProblem: 'Find the determinant of [[4, 3], [2, 5]].',
      steps: [
        'Step 1: Multiply main diagonal (a · d): 4 × 5 = 20.',
        'Step 2: Multiply other diagonal (b · c): 3 × 2 = 6.',
        'Step 3: Subtract (ad − bc): 20 − 6 = 14.'
      ],
      check: {
        prompt: 'Quick Check: What is the determinant of [[5, 2], [3, 4]]?',
        choices: ['14', '26', '−14', '7'],
        answer: '14',
        explanation: 'ad − bc = (5 × 4) − (2 × 3) = 20 − 6 = 14.'
      }
    },
    conic_sections: {
      id: 'conic_sections',
      domain: 'coord_geo',
      title: 'Conic Sections: Circles & Parabola Vertex Form',
      summary: 'A circle centered at (h, k) with radius r has equation (x − h)² + (y − k)² = r². A parabola in vertex form y = a(x − h)² + k has its vertex at (h, k).',
      formula: 'Circle: (x − h)² + (y − k)² = r²   |   Parabola Vertex: y = a(x − h)² + k',
      actTip: 'Two classic ACT traps on circles: (1) FLIP the signs inside parentheses to read center (h, k)—so (x + 3)² means h = −3! (2) Take the SQUARE ROOT of the right side to get radius r!',
      exampleProblem: 'Find the center and radius of (x − 4)² + (y + 2)² = 25.',
      steps: [
        'Step 1: Flip the signs inside parentheses: x − 4 → h = +4, and y + 2 → k = −2. Center is (4, −2).',
        'Step 2: The right side is r² = 25, so take the square root: r = √25 = 5.'
      ],
      check: {
        prompt: 'Quick Check: What is the radius of (x − 1)² + (y + 5)² = 36?',
        choices: ['6', '36', '18', '12'],
        answer: '6',
        explanation: 'The right side equals r² = 36, so radius r = √36 = 6!'
      }
    },
    sequences_series: {
      id: 'sequences_series',
      domain: 'algebra2',
      title: 'Arithmetic & Geometric Sequences',
      summary: 'Arithmetic sequences ADD the same common difference (d) each step. Geometric sequences MULTIPLY by the same common ratio (r) each step.',
      formula: 'Arithmetic: a_n = a₁ + (n − 1)d   |   Geometric: a_n = a₁ · r^(n − 1)',
      actTip: 'Notice the (n − 1)! To jump from the 1st term to the 10th term, you only take 9 steps (not 10!).',
      exampleProblem: 'An arithmetic sequence starts 4, 7, 10, ... What is the 10th term?',
      steps: [
        'Step 1: Identify first term a₁ = 4 and common difference d = 7 − 4 = 3.',
        'Step 2: Plug n = 10 into a_n = a₁ + (n − 1)d → 4 + (10 − 1)(3).',
        'Step 3: Compute: 4 + 9(3) = 4 + 27 = 31.'
      ],
      check: {
        prompt: 'Quick Check: In the arithmetic sequence 5, 9, 13, ..., what is the 6th term?',
        choices: ['25', '29', '21', '24'],
        answer: '25',
        explanation: 'a₁ = 5, d = 4 → a₆ = 5 + (6 − 1)(4) = 5 + 20 = 25.'
      }
    }
  };

  // Helper utilities
  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
  function gcd(a, b) {
    a = Math.abs(a); b = Math.abs(b);
    while (b) { const t = b; b = a % b; a = t; }
    return a || 1;
  }
  function fracStr(n, d) {
    if (d < 0) { n = -n; d = -d; }
    const g = gcd(n, d);
    n /= g; d /= g;
    return d === 1 ? `${n}` : `${n}/${d}`;
  }
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // Ensures 4 unique choices with tagged distractors
  function buildChoices(correctText, distractors) {
    const seen = new Set([String(correctText)]);
    const opts = [{ text: String(correctText), isCorrect: true }];
    for (const d of distractors) {
      const t = String(d.text);
      if (!seen.has(t)) {
        seen.add(t);
        opts.push({ text: t, isCorrect: false, gapId: d.gapId, whyWrong: d.whyWrong });
      }
      if (opts.length === 4) break;
    }
    // Fallback unique numeric filler if collision happened
    let guard = 1;
    while (opts.length < 4) {
      const num = parseFloat(correctText);
      const fallback = Number.isFinite(num) ? String(num + guard * 2 + 1) : `${correctText} + ${guard}`;
      if (!seen.has(fallback)) {
        seen.add(fallback);
        opts.push({
          text: fallback,
          isCorrect: false,
          gapId: distractors[0] ? distractors[0].gapId : 'inverse_operations',
          whyWrong: 'Double-check each arithmetic step carefully.'
        });
      }
      guard++;
    }
    return shuffle(opts);
  }

  // SVG Diagram Helpers for Plane Geometry & Trigonometry (just like real ACT visuals!)
  function svgRightTriangle(oppLabel, adjLabel, hypLabel, angleLabel = 'θ') {
    return `<svg width="240" height="145" viewBox="0 0 240 145">
      <polygon points="40,120 190,120 190,25" fill="rgba(56,189,248,0.14)" stroke="#38bdf8" stroke-width="2.5"/>
      <polyline points="176,120 176,106 190,106" fill="none" stroke="#94a3b8" stroke-width="2"/>
      <text x="64" y="114" fill="#facc15" font-size="14" font-weight="bold">${angleLabel}</text>
      <text x="115" y="138" fill="#f8fafc" font-size="13" text-anchor="middle">${adjLabel}</text>
      <text x="200" y="76" fill="#f8fafc" font-size="13" text-anchor="start">${oppLabel}</text>
      <text x="102" y="64" fill="#4ade80" font-size="13" font-weight="bold" text-anchor="end">${hypLabel}</text>
    </svg>`;
  }

  function svgCircle(label, isDiameter = false) {
    const line = isDiameter
      ? `<line x1="65" y1="65" x2="175" y2="65" stroke="#facc15" stroke-width="2.5"/>`
      : `<line x1="120" y1="65" x2="175" y2="65" stroke="#facc15" stroke-width="2.5"/>`;
    return `<svg width="240" height="130" viewBox="0 0 240 130">
      <circle cx="120" cy="65" r="55" fill="rgba(56,189,248,0.12)" stroke="#38bdf8" stroke-width="2.5"/>
      <circle cx="120" cy="65" r="3" fill="#facc15"/>
      ${line}
      <text x="${isDiameter ? 120 : 148}" y="57" fill="#facc15" font-size="13" font-weight="bold" text-anchor="middle">${label}</text>
    </svg>`;
  }

  // ==================== PROBLEM GENERATORS BY DOMAIN & TIER (1..5) ====================

  function genNumber(tier) {
    if (tier === 1) {
      // Easy percent of a nice number
      const pct = pick([10, 20, 25, 50]);
      const whole = pick([20, 40, 60, 80, 100, 120]);
      const ans = (pct * whole) / 100;
      return {
        domain: 'number', tier, lessonId: 'percent_part_whole',
        prompt: `What is ${pct}% of ${whole}?`,
        hint: `Convert ${pct}% to a decimal (${pct / 100}) and multiply by ${whole}.`,
        choices: buildChoices(ans, [
          { text: whole - pct, gapId: 'percent_part_whole', whyWrong: `You subtracted ${pct} from ${whole} instead of taking ${pct}% (multiplying by ${pct / 100}).` },
          { text: ans * 2, gapId: 'percent_part_whole', whyWrong: `Check your fraction: ${pct}% is ${pct}/100 of ${whole}, not twice that.` },
          { text: Math.round(whole / pct * 10) / 10, gapId: 'percent_part_whole', whyWrong: `Don't divide ${whole} by ${pct}; multiply ${whole} by ${pct / 100}.` }
        ]),
        steps: [
          `Convert ${pct}% to a decimal: ${pct} ÷ 100 = ${pct / 100}.`,
          `Multiply: ${pct / 100} × ${whole} = ${ans}.`
        ]
      };
    }
    if (tier === 2) {
      // Discount / Sale price
      const price = pick([40, 50, 60, 80, 120]);
      const off = pick([15, 20, 25, 30]);
      const disc = (price * off) / 100;
      const ans = price - disc;
      return {
        domain: 'number', tier, lessonId: 'percent_part_whole',
        prompt: `An enchanted sword originally costs \$${price}, and it is on sale for ${off}% off. What is the sale price?`,
        hint: `Find ${off}% of ${price}, then subtract that discount from ${price} (or multiply ${price} by ${(100 - off) / 100}).`,
        choices: buildChoices(`\$${ans}`, [
          { text: `\$${disc}`, gapId: 'percent_part_whole', whyWrong: `\$${disc} is the DISCOUNT amount you save, not the final sale price! Subtract it from \$${price}.` },
          { text: `\$${price - off}`, gapId: 'percent_part_whole', whyWrong: `${off}% off is NOT subtracting \$${off} directly—multiply ${off / 100} × ${price} first.` },
          { text: `\$${price + disc}`, gapId: 'percent_part_whole', whyWrong: `A discount lowers the price, so subtract \$${disc} instead of adding it.` }
        ]),
        steps: [
          `Find the discount: ${off}% of \$${price} = ${off / 100} × ${price} = \$${disc}.`,
          `Subtract from original price: \$${price} − \$${disc} = \$${ans}.`
        ]
      };
    }
    if (tier === 3) {
      // Exponent rules
      const a = randInt(2, 6);
      const b = randInt(2, 5);
      const c = randInt(1, a + b - 2);
      const ansExp = a + b - c;
      return {
        domain: 'number', tier, lessonId: 'exponents_roots',
        prompt: `For x ≠ 0, which expression is equivalent to (x^${a} · x^${b}) / x^${c}?`,
        hint: `Multiplying same bases ADDS exponents; dividing SUBTRACTS exponents.`,
        choices: buildChoices(`x^${ansExp}`, [
          { text: `x^${a * b - c}`, gapId: 'exponents_roots', whyWrong: `When multiplying x^${a} · x^${b}, ADD the exponents (${a}+${b}=${a + b}), don't multiply them!` },
          { text: `x^${a + b + c}`, gapId: 'exponents_roots', whyWrong: `Dividing by x^${c} SUBTRACTS ${c} from the exponent, rather than adding.` },
          { text: `x^${Math.max(1, Math.round((a + b) / c))}`, gapId: 'exponents_roots', whyWrong: `With exponents, division of powers means SUBTRACT exponents (${a + b} − ${c}), not divide them.` }
        ]),
        steps: [
          `Combine the numerator by adding exponents: x^${a} · x^${b} = x^(${a}+${b}) = x^${a + b}.`,
          `Divide by x^${c} by subtracting exponents: x^(${a + b} − ${c}) = x^${ansExp}.`
        ]
      };
    }
    if (tier === 4) {
      // Percent increase / original price reverse!
      const oldP = pick([40, 50, 80, 100, 120]);
      const pct = pick([20, 25, 50]);
      const newP = oldP + (oldP * pct) / 100;
      const trapDivNew = Math.round(((newP - oldP) / newP) * 100);
      return {
        domain: 'number', tier, lessonId: 'percent_part_whole',
        prompt: `A village's emerald supply grew from ${oldP} gems to ${newP} gems. What was the percent increase?`,
        hint: `Percent Change = (New − Old) ÷ Old × 100%. Always divide by the ORIGINAL value!`,
        choices: buildChoices(`${pct}%`, [
          { text: `${trapDivNew}%`, gapId: 'percent_part_whole', whyWrong: `Classic ACT trap! You divided the change (${newP - oldP}) by the NEW value (${newP}) instead of the ORIGINAL value (${oldP}).` },
          { text: `${newP - oldP}%`, gapId: 'percent_part_whole', whyWrong: `${newP - oldP} is the raw gem increase—you still need to divide by the original ${oldP} and multiply by 100%.` },
          { text: `${pct + 10}%`, gapId: 'percent_part_whole', whyWrong: `Compute (${newP} − ${oldP}) / ${oldP} = ${newP - oldP}/${oldP} = ${pct / 100} = ${pct}%.` }
        ]),
        steps: [
          `Find the amount of change: ${newP} − ${oldP} = ${newP - oldP}.`,
          `Divide by the ORIGINAL amount (${oldP}): ${newP - oldP} / ${oldP} = ${pct / 100}.`,
          `Convert to a percent: ${pct / 100} × 100% = ${pct}%.`
        ]
      };
    }
    // Tier 5: Successive percent change (ACT 32+ classic!)
    const inc = pick([20, 25, 40]);
    const dec = pick([20, 25, 10]);
    const finalFactor = (1 + inc / 100) * (1 - dec / 100);
    const netPct = Math.round((finalFactor - 1) * 100);
    const ansLabel = netPct === 0 ? '0% (No change)' : (netPct > 0 ? `+${netPct}% increase` : `${netPct}% decrease`);
    const naive = inc - dec;
    const naiveLabel = naive === 0 ? '0% (No change)' : (naive > 0 ? `+${naive}% increase` : `${naive}% decrease`);
    return {
      domain: 'number', tier: 5, lessonId: 'percent_part_whole',
      prompt: `An ore's value increases by ${inc}%, and the next day decreases by ${dec}%. What is the net percent change from the original value?`,
      hint: `Pick a starting value of 100! Apply +${inc}%, then apply −${dec}% to the NEW amount.`,
      choices: buildChoices(ansLabel, [
        { text: naiveLabel === ansLabel ? `${netPct - 4}% decrease` : naiveLabel, gapId: 'percent_part_whole', whyWrong: `You can't just add/subtract percentages (${inc}% − ${dec}%)! The second percent applies to the NEW value (${100 + inc}), not 100.` },
        { text: `+${inc + dec}% increase`, gapId: 'percent_part_whole', whyWrong: `One change is a decrease, and successive changes multiply: ${(1 + inc/100).toFixed(2)} × ${(1 - dec/100).toFixed(2)}.` },
        { text: `${netPct - 5}% decrease`, gapId: 'percent_part_whole', whyWrong: `Start with 100 → ${100 + inc} → ${Math.round(100 * finalFactor)}. Compare to 100.` }
      ]),
      steps: [
        `Test with a starting price of 100.`,
        `After a ${inc}% increase: 100 × ${(1 + inc / 100).toFixed(2)} = ${100 + inc}.`,
        `After a ${dec}% decrease on ${100 + inc}: ${100 + inc} × ${(1 - dec / 100).toFixed(2)} = ${Math.round(100 * finalFactor)}.`,
        `Compare ${Math.round(100 * finalFactor)} to 100 → ${ansLabel}.`
      ]
    };
  }

  function genAlgebra1(tier) {
    if (tier === 1) {
      // Clean two-step linear equation ax + b = c
      const a = randInt(2, 6);
      const x = randInt(2, 9);
      const b = randInt(3, 12);
      const isMinus = Math.random() < 0.5;
      const c = isMinus ? a * x - b : a * x + b;
      const signStr = isMinus ? `− ${b}` : `+ ${b}`;
      const wrongSignVal = isMinus ? fracStr(c - b, a) : fracStr(c + b, a);
      return {
        domain: 'algebra1', tier, lessonId: 'inverse_operations',
        prompt: `Solve for x:  ${a}x ${signStr} = ${c}`,
        hint: `First undo "${signStr}" by doing the opposite to both sides, then divide by ${a}.`,
        choices: buildChoices(x, [
          { text: wrongSignVal, gapId: 'inverse_operations', whyWrong: `Watch the inverse operation! To undo "${signStr}", you must ${isMinus ? 'ADD' : 'SUBTRACT'} ${b} on both sides.` },
          { text: a * x, gapId: 'inverse_operations', whyWrong: `You isolated ${a}x = ${a * x} nicely, but forgot the final step: divide by ${a}!` },
          { text: x + 2, gapId: 'inverse_operations', whyWrong: `Plug x = ${x + 2} back in: ${a}(${x + 2}) ${signStr} ≠ ${c}.` }
        ]),
        steps: [
          `${isMinus ? 'Add' : 'Subtract'} ${b} on both sides: ${a}x = ${a * x}.`,
          `Divide both sides by ${a}: x = ${a * x} ÷ ${a} = ${x}.`
        ]
      };
    }
    if (tier === 2) {
      // Distributive property a(x - b) = c
      const a = randInt(2, 5);
      const b = randInt(2, 6);
      const x = randInt(b + 1, b + 8);
      const c = a * (x - b);
      return {
        domain: 'algebra1', tier, lessonId: 'distributive_negatives',
        prompt: `What value of x satisfies  ${a}(x − ${b}) = ${c}?`,
        hint: `Either distribute ${a} to BOTH x and −${b}, or divide both sides by ${a} first!`,
        choices: buildChoices(x, [
          { text: fracStr(c + b, a), gapId: 'distributive_negatives', whyWrong: `It looks like you wrote ${a}x − ${b} instead of multiplying ${a} × ${b} = ${a * b} when distributing!` },
          { text: x - 2 * b, gapId: 'inverse_operations', whyWrong: `After getting x − ${b} = ${x - b}, ADD ${b} to both sides instead of subtracting.` },
          { text: c / a, gapId: 'inverse_operations', whyWrong: `${c / a} equals (x − ${b}). Don't forget to add ${b} to solve for x!` }
        ]),
        steps: [
          `Distribute ${a} to both terms: ${a}x − ${a * b} = ${c}.`,
          `Add ${a * b} to both sides: ${a}x = ${c + a * b}.`,
          `Divide by ${a}: x = ${x}.`
        ]
      };
    }
    if (tier === 3) {
      // Variables on both sides
      const x = randInt(2, 8);
      const a = randInt(4, 8);
      const d = randInt(1, a - 2);
      const b = randInt(2, 10);
      const e = (a - d) * x - b; // a*x - b = d*x + e
      return {
        domain: 'algebra1', tier, lessonId: 'inverse_operations',
        prompt: `Solve for x:  ${a}x − ${b} = ${d}x ${e >= 0 ? '+ ' + e : '− ' + Math.abs(e)}`,
        hint: `Move all x-terms to the left (subtract ${d}x) and constants to the right (add ${b}).`,
        choices: buildChoices(x, [
          { text: fracStr(e + b, a + d), gapId: 'inverse_operations', whyWrong: `To move ${d}x across the equals sign, SUBTRACT ${d}x from ${a}x (giving ${a - d}x), don't add them!` },
          { text: fracStr(e - b, a - d), gapId: 'inverse_operations', whyWrong: `To undo −${b} on the left, ADD ${b} to the right side.` },
          { text: (a - d) * x, gapId: 'inverse_operations', whyWrong: `You found ${a - d}x = ${(a - d) * x}, now divide both sides by ${a - d}.` }
        ]),
        steps: [
          `Subtract ${d}x from both sides: ${a - d}x − ${b} = ${e}.`,
          `Add ${b} to both sides: ${a - d}x = ${e + b}.`,
          `Divide by ${a - d}: x = ${x}.`
        ]
      };
    }
    if (tier === 4) {
      // System of 2 equations (Elimination)
      const x = randInt(2, 9);
      const y = randInt(1, 7);
      const sum = x + y;
      const diff = x - y;
      const askY = Math.random() < 0.45;
      const targetVar = askY ? 'y' : 'x';
      const ans = askY ? y : x;
      return {
        domain: 'algebra1', tier, lessonId: 'systems_equations',
        prompt: `If  x + y = ${sum}  and  x − y = ${diff},  what is the value of ${targetVar}?`,
        hint: `Add the two equations straight down so +y and −y cancel out!`,
        choices: buildChoices(ans, [
          { text: askY ? x : y, gapId: 'systems_equations', whyWrong: `Careful! You found ${askY ? 'x' : 'y'}, but the question asked for ${targetVar}! Always re-read the target variable on the ACT.` },
          { text: sum + diff, gapId: 'systems_equations', whyWrong: `Adding the equations gives 2x = ${sum + diff}—don't forget to divide by 2!` },
          { text: Math.abs(sum - diff), gapId: 'systems_equations', whyWrong: `Remember 2y = ${sum - diff}, so divide by 2 to get y = ${y}.` }
        ]),
        steps: [
          `Add the two equations: (x + y) + (x − y) = ${sum} + ${diff} → 2x = ${sum + diff}.`,
          `Divide by 2 → x = ${x}.`,
          `Substitute x = ${x} into x + y = ${sum} → y = ${y}. So ${targetVar} = ${ans}.`
        ]
      };
    }
    // Tier 5: Weighted system asking for a linear combo (classic ACT)
    const x = randInt(2, 7);
    const y = randInt(2, 7);
    const c1 = 2 * x + 3 * y;
    const c2 = 3 * x + 2 * y;
    const ans = x + y;
    return {
      domain: 'algebra1', tier: 5, lessonId: 'systems_equations',
      prompt: `If  2x + 3y = ${c1}  and  3x + 2y = ${c2},  what is the value of  x + y?`,
      hint: `ACT Shortcut! Add the two entire equations together—notice what coefficient appears in front of both x and y!`,
      choices: buildChoices(ans, [
        { text: c1 + c2, gapId: 'systems_equations', whyWrong: `Adding both equations gives 5x + 5y = ${c1 + c2}—now divide the whole equation by 5!` },
        { text: Math.abs(c1 - c2), gapId: 'systems_equations', whyWrong: `Subtracting gives x − y, not x + y. Try ADDING the two equations instead.` },
        { text: ans + 2, gapId: 'systems_equations', whyWrong: `Check: 5(x + y) = ${c1} + ${c2} = ${c1 + c2}, so x + y = ${ans}.` }
      ]),
      steps: [
        `Add the two equations together: (2x + 3x) + (3y + 2y) = ${c1} + ${c2}.`,
        `Simplify: 5x + 5y = ${c1 + c2}.`,
        `Divide every term by 5: x + y = ${ans}!`
      ]
    };
  }

  // ==================== ADVANCED ACT TOPIC GENERATORS ====================
  function genLogarithm(tier = 4) {
    if (tier <= 3 || Math.random() < 0.5) {
      // Evaluate log_b(b^k)
      const pairs = [
        { b: 2, k: 3, v: 8 }, { b: 2, k: 4, v: 16 }, { b: 2, k: 5, v: 32 },
        { b: 3, k: 3, v: 27 }, { b: 3, k: 4, v: 81 }, { b: 5, k: 3, v: 125 },
        { b: 4, k: 3, v: 64 }, { b: 10, k: 3, v: 1000 }
      ];
      const p = pick(pairs);
      return {
        domain: 'algebra2', tier, lessonId: 'logarithms',
        prompt: `What is the value of  log_${p.b}(${p.v})?`,
        hint: `Ask yourself: ${p.b} raised to WHAT power equals ${p.v}? (${p.b}^y = ${p.v})`,
        choices: buildChoices(p.k, [
          { text: p.v / p.b, gapId: 'logarithms', whyWrong: `A logarithm is NOT division (${p.v} ÷ ${p.b})! Ask what EXPONENT on ${p.b} gives ${p.v}.` },
          { text: p.k + 1, gapId: 'logarithms', whyWrong: `Check powers of ${p.b}: ${p.b}^${p.k} = ${p.v}, whereas ${p.b}^${p.k + 1} = ${Math.pow(p.b, p.k + 1)}.` },
          { text: p.b, gapId: 'logarithms', whyWrong: `${p.b} is the base; the answer is the exponent (${p.k}) such that ${p.b}^${p.k} = ${p.v}.` }
        ]),
        steps: [
          `Rewrite log_${p.b}(${p.v}) = y in exponential form: ${p.b}^y = ${p.v}.`,
          `Since ${p.b}^${p.k} = ${p.v}, we get y = ${p.k}.`
        ]
      };
    }
    // Solve log_b(x) = k OR combine logs
    if (Math.random() < 0.5) {
      const b = pick([2, 3, 4, 5]);
      const k = pick([2, 3]);
      const x = Math.pow(b, k);
      return {
        domain: 'algebra2', tier: 5, lessonId: 'logarithms',
        prompt: `If  log_${b}(x) = ${k},  what is the value of x?`,
        hint: `Use the ACT Loop Trick: log_${b}(x) = ${k}  ⇔  ${b}^${k} = x!`,
        choices: buildChoices(x, [
          { text: b * k, gapId: 'logarithms', whyWrong: `Don't multiply ${b} × ${k}! In exponential form, ${k} is the EXPONENT: x = ${b}^${k} = ${x}.` },
          { text: Math.pow(k, b), gapId: 'logarithms', whyWrong: `Keep ${b} as the base and ${k} as the exponent (${b}^${k}), not ${k}^${b}!` },
          { text: b + k, gapId: 'logarithms', whyWrong: `Rewrite log_${b}(x) = ${k} as ${b}^${k} = x = ${x}.` }
        ]),
        steps: [
          `Convert from log form to exponential form: x = ${b}^${k}.`,
          `Evaluate ${b}^${k} = ${x}.`
        ]
      };
    }
    // Log product rule: log_b(m) + log_b(n) = log_b(m*n)
    const b = pick([2, 3, 6]);
    const pairs = b === 2 ? [[4, 8, 5], [2, 16, 5], [4, 4, 4]] : (b === 3 ? [[3, 9, 3], [9, 9, 4]] : [[2, 18, 2], [3, 12, 2]]);
    const [m, n, ans] = pick(pairs);
    return {
      domain: 'algebra2', tier: 5, lessonId: 'logarithms',
      prompt: `What is the value of  log_${b}(${m}) + log_${b}(${n})?`,
      hint: `Log Product Rule: Adding logs with the same base MULTIPLIES their insides: log_${b}(${m} × ${n})!`,
      choices: buildChoices(ans, [
        { text: m + n, gapId: 'logarithms', whyWrong: `Adding logs multiplies the inside values (${m}×${n}=${m * n}) and THEN takes log_${b}(${m * n}) = ${ans}.` },
        { text: ans + 1, gapId: 'logarithms', whyWrong: `Check: ${m} × ${n} = ${m * n} = ${b}^${ans}, so log_${b}(${m * n}) = ${ans}.` },
        { text: ans * 2, gapId: 'logarithms', whyWrong: `Combine first: log_${b}(${m} × ${n}) = log_${b}(${m * n}) = ${ans}.` }
      ]),
      steps: [
        `Apply log product rule: log_${b}(${m}) + log_${b}(${n}) = log_${b}(${m} × ${n}) = log_${b}(${m * n}).`,
        `Since ${b}^${ans} = ${m * n}, the value is ${ans}.`
      ]
    };
  }

  function genComplexNumber(tier = 4) {
    if (tier <= 3 || Math.random() < 0.45) {
      // Powers of i (classic ACT!)
      const exp = pick([14, 15, 17, 22, 23, 25, 30, 31, 34, 38, 43]);
      const rem = exp % 4;
      const map = { 0: '1', 1: 'i', 2: '−1', 3: '−i' };
      const ans = map[rem];
      const others = ['1', 'i', '−1', '−i'].filter(v => v !== ans);
      return {
        domain: 'algebra2', tier, lessonId: 'complex_numbers',
        prompt: `Given i = √(−1), what is  i^${exp}  equivalent to?`,
        hint: `Powers of i repeat every 4 (i, −1, −i, 1). Divide ${exp} by 4 and look at the REMAINDER!`,
        choices: buildChoices(ans, others.map(o => ({
          text: o,
          gapId: 'complex_numbers',
          whyWrong: `${exp} ÷ 4 has remainder ${rem}, so i^${exp} = i^${rem} = ${ans} (remember cycle: i¹=i, i²=−1, i³=−i, i⁴=1).`
        }))),
        steps: [
          `Divide the exponent ${exp} by 4: ${exp} = 4 × ${Math.floor(exp / 4)} + remainder ${rem}.`,
          `Therefore i^${exp} = i^${rem} = ${ans}.`
        ]
      };
    }
    // Multiply (a + bi)(c + di)
    const a = randInt(2, 5);
    const b = randInt(1, 4);
    const c = randInt(1, 4);
    const d = randInt(1, 3);
    // (a + bi)(c - di) = (ac + bd) + (bc - ad)i
    const real = a * c + b * d;
    const imag = b * c - a * d;
    const fmt = (r, im) => im === 0 ? `${r}` : (im > 0 ? `${r} + ${im}i` : `${r} − ${Math.abs(im)}i`);
    const ans = fmt(real, imag);
    const forgotNegI2 = fmt(a * c - b * d, imag);
    return {
      domain: 'algebra2', tier: 5, lessonId: 'complex_numbers',
      prompt: `For i = √(−1), which expression equals  (${a} + ${b}i)(${c} − ${d}i)?`,
      hint: `FOIL the two binomials, then replace i² with −1 (watch the double negative on −${b * d}i²!).`,
      choices: buildChoices(ans, [
        { text: forgotNegI2, gapId: 'complex_numbers', whyWrong: `Classic complex trap! −${b * d}i² = −${b * d}(−1) = +${b * d}, so ADD ${b * d} to ${a * c} to get ${real}!` },
        { text: fmt(a * c, -b * d), gapId: 'complex_numbers', whyWrong: `Don't forget the Outer and Inner FOIL terms: ${a}(−${d}i) + ${b}i(${c})!` },
        { text: fmt(real, -imag || 2), gapId: 'complex_numbers', whyWrong: `Double-check the middle i-terms: (${b * c}i) + (−${a * d}i) = ${imag}i.` }
      ]),
      steps: [
        `FOIL: (${a})(${c}) + (${a})(−${d}i) + (${b}i)(${c}) + (${b}i)(−${d}i) = ${a * c} − ${a * d}i + ${b * c}i − ${b * d}i².`,
        `Replace i² with −1: −${b * d}(−1) = +${b * d}.`,
        `Combine real and imaginary parts: (${a * c} + ${b * d}) + (${b * c} − ${a * d})i = ${ans}.`
      ]
    };
  }

  function genMatrix(tier = 4) {
    if (tier <= 3 || Math.random() < 0.45) {
      // 2x2 Determinant [[a, b], [c, d]]
      const a = randInt(2, 7);
      const b = randInt(1, 6);
      const c = randInt(1, 5);
      const d = randInt(2, 7);
      const det = a * d - b * c;
      return {
        domain: 'trig_stats', tier, lessonId: 'matrices',
        prompt: `What is the determinant of the 2×2 matrix  [ ${a}   ${b} ;  ${c}   ${d} ]  (top row ${a}, ${b}; bottom row ${c}, ${d})?`,
        hint: `For [[a, b], [c, d]], the determinant is ad − bc (main diagonal minus the other diagonal).`,
        choices: buildChoices(det, [
          { text: a * d + b * c, gapId: 'matrices', whyWrong: `You ADDED ad + bc instead of SUBTRACTING! Determinant = ad − bc = ${a * d} − ${b * c} = ${det}.` },
          { text: b * c - a * d, gapId: 'matrices', whyWrong: `You reversed the subtraction (bc − ad)! Always start with top-left × bottom-right (ad − bc).` },
          { text: a * b - c * d, gapId: 'matrices', whyWrong: `Multiply DIAGONALS (a·d and b·c), not rows (a·b and c·d)!` }
        ]),
        steps: [
          `Multiply main diagonal (a · d): ${a} × ${d} = ${a * d}.`,
          `Multiply other diagonal (b · c): ${b} × ${c} = ${b * c}.`,
          `Subtract (ad − bc): ${a * d} − ${b * c} = ${det}.`
        ]
      };
    }
    // Scalar + Matrix addition asking for one entry or full matrix
    const k = randInt(2, 4);
    const a1 = randInt(1, 5), b1 = randInt(1, 5);
    const a2 = randInt(1, 5), b2 = randInt(1, 5);
    const ans = k * a1 + a2;
    return {
      domain: 'trig_stats', tier: 5, lessonId: 'matrices',
      prompt: `If A = [ ${a1}  ${b1} ] and B = [ ${a2}  ${b2} ], what is the FIRST entry of  ${k}A + B?`,
      hint: `Multiply every entry of A by ${k} first, then add the matching entry from B!`,
      choices: buildChoices(ans, [
        { text: k * (a1 + a2), gapId: 'matrices', whyWrong: `Only A is multiplied by ${k} (${k}A + B), not B! Compute ${k}(${a1}) + ${a2} = ${ans}.` },
        { text: a1 + a2, gapId: 'matrices', whyWrong: `Don't forget to scale matrix A by ${k} before adding B!` },
        { text: k * b1 + b2, gapId: 'matrices', whyWrong: `That's the SECOND entry! The question asks for the FIRST entry: ${k}(${a1}) + ${a2} = ${ans}.` }
      ]),
      steps: [
        `Scale first entry of A by ${k}: ${k} × ${a1} = ${k * a1}.`,
        `Add first entry of B: ${k * a1} + ${a2} = ${ans}.`
      ]
    };
  }

  function genConicSection(tier = 4) {
    if (Math.random() < 0.6) {
      // Circle equation (x - h)^2 + (y + k)^2 = r^2
      const h = randInt(2, 7);
      const k = randInt(1, 6);
      const r = randInt(3, 9);
      const r2 = r * r;
      const askCenter = Math.random() < 0.55;
      if (askCenter) {
        return {
          domain: 'coord_geo', tier, lessonId: 'conic_sections',
          prompt: `A circle in the (x, y) plane has equation  (x − ${h})² + (y + ${k})² = ${r2}.  What are the coordinates of its CENTER?`,
          hint: `Compare to (x − h)² + (y − k)² = r². Remember to FLIP the signs inside the parentheses!`,
          choices: buildChoices(`(${h}, −${k})`, [
            { text: `(−${h}, ${k})`, gapId: 'conic_sections', whyWrong: `You kept the raw signs from inside the parentheses! Always FLIP both signs: (x − ${h}) → +${h}, and (y + ${k}) → −${k}.` },
            { text: `(${h}, ${k})`, gapId: 'conic_sections', whyWrong: `Watch (y + ${k})²! Since it's (y − (−${k}))², the y-coordinate of the center is NEGATIVE (−${k}).` },
            { text: `(−${h}, −${k})`, gapId: 'conic_sections', whyWrong: `(x − ${h})² has a positive center x = +${h}, while (y + ${k})² gives y = −${k}.` }
          ]),
          steps: [
            `Match to standard circle form (x − h)² + (y − k)² = r².`,
            `x − ${h} = 0 → h = ${h};  y + ${k} = 0 → k = −${k}.`,
            `Center is (${h}, −${k}) with radius √${r2} = ${r}.`
          ]
        };
      }
      return {
        domain: 'coord_geo', tier, lessonId: 'conic_sections',
        prompt: `What is the RADIUS of the circle given by  (x + ${h})² + (y − ${k})² = ${r2}?`,
        hint: `The number on the right side is r² (radius SQUARED)—take its square root!`,
        choices: buildChoices(r, [
          { text: r2, gapId: 'conic_sections', whyWrong: `Classic ACT trap! ${r2} is r² (radius squared). Take the square root: r = √${r2} = ${r}!` },
          { text: r * 2, gapId: 'conic_sections', whyWrong: `${r * 2} is the DIAMETER (2r), not the radius r = ${r}!` },
          { text: Math.round(r2 / 2), gapId: 'conic_sections', whyWrong: `Take the SQUARE ROOT of ${r2} (√${r2} = ${r}), don't divide by 2.` }
        ]),
        steps: [
          `In standard form (x − h)² + (y − k)² = r², we have r² = ${r2}.`,
          `Take the square root: r = √${r2} = ${r}.`
        ]
      };
    }
    // Parabola vertex form y = a(x + h)^2 + k
    const a = randInt(2, 4);
    const h = randInt(2, 6);
    const k = randInt(1, 8);
    return {
      domain: 'coord_geo', tier, lessonId: 'conic_sections',
      prompt: `What is the VERTEX of the parabola  y = ${a}(x + ${h})² − ${k}?`,
      hint: `In vertex form y = a(x − h)² + k, flip the sign inside parentheses for x, and keep the outside sign for y!`,
      choices: buildChoices(`(−${h}, −${k})`, [
        { text: `(${h}, −${k})`, gapId: 'conic_sections', whyWrong: `Flip the sign INSIDE parentheses! (x + ${h})² means x = −${h}, not +${h}.` },
        { text: `(−${h}, ${k})`, gapId: 'conic_sections', whyWrong: `Keep the sign OUTSIDE parentheses as-is: −${k} means y = −${k}!` },
        { text: `(${a}, −${k})`, gapId: 'conic_sections', whyWrong: `${a} controls the stretch/width, not the vertex x-coordinate (−${h}).` }
      ]),
      steps: [
        `Compare to y = a(x − h)² + k.`,
        `Set x + ${h} = 0 → h = −${h}. The outside constant is k = −${k}.`,
        `Vertex = (−${h}, −${k}).`
      ]
    };
  }

  function genSequence(tier = 3) {
    if (tier <= 3 || Math.random() < 0.55) {
      // Arithmetic sequence nth term
      const a1 = randInt(2, 8);
      const d = randInt(3, 6);
      const n = randInt(7, 12);
      const ans = a1 + (n - 1) * d;
      return {
        domain: 'algebra2', tier, lessonId: 'sequences_series',
        prompt: `An arithmetic sequence begins  ${a1}, ${a1 + d}, ${a1 + 2 * d}, ${a1 + 3 * d}, ...  What is the ${n}th term?`,
        hint: `Use a_n = a₁ + (n − 1)d. Notice you multiply d by (n − 1), not n!`,
        choices: buildChoices(ans, [
          { text: a1 + n * d, gapId: 'sequences_series', whyWrong: `Watch the (n − 1) rule! Multiplying by ${n} instead of (${n} − 1) = ${n - 1} gives the ${n + 1}th term!` },
          { text: n * d, gapId: 'sequences_series', whyWrong: `Don't forget to start from the first term a₁ = ${a1} and take ${n - 1} steps of ${d}.` },
          { text: ans - d, gapId: 'sequences_series', whyWrong: `Check: ${a1} + (${n} − 1)(${d}) = ${a1} + ${(n - 1) * d} = ${ans}.` }
        ]),
        steps: [
          `Identify a₁ = ${a1} and common difference d = ${d}.`,
          `Use a_${n} = a₁ + (${n} − 1)d = ${a1} + ${n - 1}(${d}) = ${a1} + ${(n - 1) * d} = ${ans}.`
        ]
      };
    }
    // Geometric sequence 5th term
    const a1 = randInt(2, 5);
    const r = pick([2, 3]);
    const n = r === 2 ? 5 : 4;
    const ans = a1 * Math.pow(r, n - 1);
    return {
      domain: 'algebra2', tier: 4, lessonId: 'sequences_series',
      prompt: `A geometric sequence starts  ${a1}, ${a1 * r}, ${a1 * r * r}, ...  What is the ${n}th term?`,
      hint: `Each term multiplies by common ratio r = ${r}. Use a_n = a₁ · r^(n − 1).`,
      choices: buildChoices(ans, [
        { text: a1 * Math.pow(r, n), gapId: 'sequences_series', whyWrong: `Use r^(n−1) = ${r}^${n - 1}, not ${r}^${n}! You went one step too far.` },
        { text: a1 + (n - 1) * (a1 * r - a1), gapId: 'sequences_series', whyWrong: `This is a GEOMETRIC sequence (multiply by ${r} each time), not arithmetic!` },
        { text: a1 * r * (n - 1), gapId: 'sequences_series', whyWrong: `Raise ${r} to the power ${n - 1} (${r}^${n - 1} = ${Math.pow(r, n - 1)}), don't multiply ${r} × ${n - 1}.` }
      ]),
      steps: [
        `Find common ratio r = ${a1 * r} ÷ ${a1} = ${r}.`,
        `Use a_${n} = ${a1} × ${r}^(${n} − 1) = ${a1} × ${Math.pow(r, n - 1)} = ${ans}.`
      ]
    };
  }

  function genAlgebra2(tier) {
    // Mix in Sequences, Logarithms, and Complex Numbers at Tiers 3-5!
    if (tier === 3 && Math.random() < 0.35) return genSequence(3);
    if (tier === 4 && Math.random() < 0.38) return Math.random() < 0.5 ? genLogarithm(4) : genComplexNumber(4);
    if (tier === 5 && Math.random() < 0.65) return pick([() => genLogarithm(5), () => genComplexNumber(5), () => genSequence(4)])();
    if (tier === 1) {
      // Evaluating linear function f(x)
      const m = randInt(2, 6);
      const b = randInt(1, 9);
      const v = randInt(2, 7);
      const ans = m * v - b;
      return {
        domain: 'algebra2', tier, lessonId: 'function_notation',
        prompt: `If f(x) = ${m}x − ${b}, what is f(${v})?`,
        hint: `Replace x with ${v}: calculate ${m}(${v}) − ${b}.`,
        choices: buildChoices(ans, [
          { text: m * v + b, gapId: 'function_notation', whyWrong: `Watch the minus sign in ${m}x − ${b}: subtract ${b} instead of adding.` },
          { text: m + v - b, gapId: 'function_notation', whyWrong: `${m}x means ${m} TIMES x (${m} × ${v}), not ${m} + ${v}.` },
          { text: ans * v, gapId: 'function_notation', whyWrong: `f(${v}) does NOT mean multiply the result by ${v}; ${v} is just the input!` }
        ]),
        steps: [
          `Substitute x = ${v} into f(x): f(${v}) = ${m}(${v}) − ${b}.`,
          `Multiply first: ${m * v} − ${b} = ${ans}.`
        ]
      };
    }
    if (tier === 2) {
      // Evaluating quadratic function
      const v = randInt(2, 5);
      const b = randInt(2, 5);
      const c = randInt(1, 6);
      const ans = v * v - b * v + c;
      return {
        domain: 'algebra2', tier, lessonId: 'function_notation',
        prompt: `If g(x) = x² − ${b}x + ${c}, what is g(${v})?`,
        hint: `Plug ${v} into EVERY x: (${v})² − ${b}(${v}) + ${c}.`,
        choices: buildChoices(ans, [
          { text: 2 * v - b * v + c, gapId: 'exponents_roots', whyWrong: `${v}² means ${v} × ${v} = ${v * v}, NOT 2 × ${v}!` },
          { text: v * v + b * v + c, gapId: 'function_notation', whyWrong: `Watch the middle sign: it's − ${b}x, so subtract ${b * v}.` },
          { text: v * v - b + c, gapId: 'function_notation', whyWrong: `Remember to substitute ${v} into the second x too: ${b}(${v}) = ${b * v}.` }
        ]),
        steps: [
          `Substitute x = ${v}: (${v})² − ${b}(${v}) + ${c}.`,
          `Evaluate powers and products: ${v * v} − ${b * v} + ${c}.`,
          `Simplify: ${ans}.`
        ]
      };
    }
    if (tier === 3) {
      // Factoring x^2 + bx + c = 0
      const r1 = randInt(2, 6);
      const r2 = randInt(r1 + 1, 9);
      const b = -(r1 + r2);
      const c = r1 * r2;
      return {
        domain: 'algebra2', tier, lessonId: 'quad_factoring',
        prompt: `What are the solutions to  x² − ${r1 + r2}x + ${c} = 0?`,
        hint: `Find two numbers that multiply to +${c} and add to −${r1 + r2}. Then flip their signs for the roots!`,
        choices: buildChoices(`x = ${r1} and x = ${r2}`, [
          { text: `x = −${r1} and x = −${r2}`, gapId: 'quad_factoring', whyWrong: `You factored it as (x − ${r1})(x − ${r2}) = 0, but forgot to FLIP THE SIGNS when solving x − ${r1} = 0 → x = +${r1}!` },
          { text: `x = 1 and x = ${c}`, gapId: 'quad_factoring', whyWrong: `1 and ${c} multiply to ${c}, but they don't add to ${r1 + r2}.` },
          { text: `x = ${r1} and x = −${r2}`, gapId: 'quad_factoring', whyWrong: `Since the constant +${c} is positive, both roots must have the SAME sign.` }
        ]),
        steps: [
          `Find two numbers that multiply to +${c} and add to ${b}: −${r1} and −${r2}.`,
          `Factor: (x − ${r1})(x − ${r2}) = 0.`,
          `Set each factor to zero: x = ${r1} and x = ${r2}.`
        ]
      };
    }
    if (tier === 4) {
      // Composite function f(g(n))
      const n = randInt(2, 5);
      const gOut = n + 3;
      const ans = 2 * gOut - 1;
      const reverseOrder = (2 * n - 1) + 3;
      return {
        domain: 'algebra2', tier, lessonId: 'function_notation',
        prompt: `Given f(x) = 2x − 1 and g(x) = x + 3, what is f(g(${n}))?`,
        hint: `Work INSIDE OUT! First find g(${n}), then plug that answer into f(x).`,
        choices: buildChoices(ans, [
          { text: reverseOrder, gapId: 'function_notation', whyWrong: `You calculated g(f(${n})) instead of f(g(${n}))! Always evaluate the INNER function g(${n}) first.` },
          { text: gOut * (2 * n - 1), gapId: 'function_notation', whyWrong: `f(g(${n})) means composition (plugging g into f), NOT multiplying f(${n}) × g(${n}).` },
          { text: ans + 2, gapId: 'function_notation', whyWrong: `Check: g(${n}) = ${gOut}, then f(${gOut}) = 2(${gOut}) − 1 = ${ans}.` }
        ]),
        steps: [
          `Step 1 (Inside): g(${n}) = ${n} + 3 = ${gOut}.`,
          `Step 2 (Outside): f(${gOut}) = 2(${gOut}) − 1 = ${2 * gOut} − 1 = ${ans}.`
        ]
      };
    }
    // Tier 5: Sum of roots / quadratic discriminant style ACT hard
    const a = randInt(2, 4);
    const sumR = randInt(3, 8);
    const b = -a * sumR;
    const c = randInt(1, 5);
    return {
      domain: 'algebra2', tier: 5, lessonId: 'quad_factoring',
      prompt: `What is the SUM of the two solutions to  ${a}x² ${b}x + ${c} = 0?`,
      hint: `ACT Formula Shortcut: For ax² + bx + c = 0, the sum of the roots is ALWAYS −b / a!`,
      choices: buildChoices(sumR, [
        { text: -sumR, gapId: 'quad_factoring', whyWrong: `Watch the negative in −b/a! Since b = ${b}, −b/a = −(${b})/${a} = +${sumR}.` },
        { text: Math.abs(b), gapId: 'quad_factoring', whyWrong: `Don't forget to divide by the leading coefficient a = ${a}: −(${b}) / ${a} = ${sumR}.` },
        { text: fracStr(c, a), gapId: 'quad_factoring', whyWrong: `c/a is the PRODUCT of the roots. The SUM of the roots is −b/a!` }
      ]),
      steps: [
        `Identify a = ${a}, b = ${b}, c = ${c}.`,
        `Use Vieta's ACT shortcut: Sum of roots = −b / a.`,
        `Compute −(${b}) / ${a} = ${-b} / ${a} = ${sumR}.`
      ]
    };
  }

  function genCoordGeo(tier) {
    // Mix in Conic Sections (Circles & Parabola Vertex Form) at Tiers 4-5!
    if (tier >= 4 && Math.random() < 0.5) return genConicSection(tier);
    if (tier === 1) {
      // Slope from two points (clean integer)
      const x1 = randInt(1, 4);
      const y1 = randInt(1, 6);
      const m = randInt(2, 5);
      const dx = randInt(2, 4);
      const x2 = x1 + dx;
      const y2 = y1 + m * dx;
      return {
        domain: 'coord_geo', tier, lessonId: 'slope_formula',
        prompt: `What is the slope of the line passing through (${x1}, ${y1}) and (${x2}, ${y2})?`,
        hint: `Slope = Rise ÷ Run = (y₂ − y₁) / (x₂ − x₁). Put the Y difference on TOP!`,
        choices: buildChoices(m, [
          { text: fracStr(1, m), gapId: 'slope_formula', whyWrong: `You flipped the slope formula (Run over Rise)! Always put Y on top: (y₂ − y₁) / (x₂ − x₁).` },
          { text: -m, gapId: 'slope_formula', whyWrong: `Check your subtraction order: subtract BOTH coordinates in the same direction (${y2}−${y1}) / (${x2}−${x1}).` },
          { text: y2 - y1, gapId: 'slope_formula', whyWrong: `${y2 - y1} is just the rise (Δy). Remember to divide by the run (Δx = ${dx})!` }
        ]),
        steps: [
          `Find rise (Δy): ${y2} − ${y1} = ${y2 - y1}.`,
          `Find run (Δx): ${x2} − ${x1} = ${dx}.`,
          `Divide: m = ${y2 - y1} / ${dx} = ${m}.`
        ]
      };
    }
    if (tier === 2) {
      // Midpoint of two points
      const x1 = randInt(1, 6) * 2;
      const x2 = x1 + randInt(2, 5) * 2;
      const y1 = randInt(1, 5) * 2;
      const y2 = y1 + randInt(2, 5) * 2;
      const mx = (x1 + x2) / 2;
      const my = (y1 + y2) / 2;
      return {
        domain: 'coord_geo', tier, lessonId: 'distance_midpoint',
        prompt: `What is the midpoint of the line segment connecting (${x1}, ${y1}) and (${x2}, ${y2})?`,
        hint: `Average the x-coordinates and average the y-coordinates: ((x₁+x₂)/2, (y₁+y₂)/2).`,
        choices: buildChoices(`(${mx}, ${my})`, [
          { text: `(${x2 - x1}, ${y2 - y1})`, gapId: 'distance_midpoint', whyWrong: `You subtracted instead of averaging! For midpoint, ADD the coordinates and divide by 2.` },
          { text: `(${x1 + x2}, ${y1 + y2})`, gapId: 'distance_midpoint', whyWrong: `You added the coordinates, but forgot to divide by 2 to get the average!` },
          { text: `(${my}, ${mx})`, gapId: 'distance_midpoint', whyWrong: `Watch coordinate order: x always comes first → (${mx}, ${my}).` }
        ]),
        steps: [
          `Average x: (${x1} + ${x2}) / 2 = ${mx}.`,
          `Average y: (${y1} + ${y2}) / 2 = ${my}.`,
          `Midpoint = (${mx}, ${my}).`
        ]
      };
    }
    if (tier === 3) {
      // Distance using 3-4-5 or 6-8-10 or 5-12-13 triple
      const triples = [[3, 4, 5], [6, 8, 10], [5, 12, 13]];
      const [dx, dy, d] = pick(triples);
      const x1 = randInt(1, 5);
      const y1 = randInt(1, 5);
      const x2 = x1 + dx;
      const y2 = y1 + dy;
      return {
        domain: 'coord_geo', tier, lessonId: 'distance_midpoint',
        prompt: `What is the distance in the standard (x, y) coordinate plane between (${x1}, ${y1}) and (${x2}, ${y2})?`,
        hint: `Use d = √[(x₂ − x₁)² + (y₂ − y₁)²] — or spot a Pythagorean triple!`,
        choices: buildChoices(d, [
          { text: dx + dy, gapId: 'distance_midpoint', whyWrong: `Adding Δx + Δy (${dx} + ${dy}) gives the block-walking path, not straight-line distance! Use √(Δx² + Δy²).` },
          { text: d * d, gapId: 'distance_midpoint', whyWrong: `You found Δx² + Δy² = ${d * d}, but forgot to take the SQUARE ROOT!` },
          { text: Math.abs(dy - dx), gapId: 'distance_midpoint', whyWrong: `Square both Δx = ${dx} and Δy = ${dy}, add them, then take the square root.` }
        ]),
        steps: [
          `Find Δx = ${x2} − ${x1} = ${dx} and Δy = ${y2} − ${y1} = ${dy}.`,
          `Compute √(${dx}² + ${dy}²) = √(${dx * dx} + ${dy * dy}) = √${d * d} = ${d}.`
        ]
      };
    }
    if (tier === 4) {
      // Perpendicular line slope!
      const num = pick([2, 3, 4]);
      const den = pick([3, 5, 7].filter(k => k !== num));
      const perp = `−${den}/${num}`;
      return {
        domain: 'coord_geo', tier, lessonId: 'slope_formula',
        prompt: `Line L has equation y = (${num}/${den})x + 4. What is the slope of a line PERPENDICULAR to line L?`,
        hint: `Perpendicular slopes are NEGATIVE RECIPROCALS: flip the fraction AND flip the sign!`,
        choices: buildChoices(perp, [
          { text: `${num}/${den}`, gapId: 'slope_formula', whyWrong: `${num}/${den} is a PARALLEL slope. Perpendicular slopes must flip the fraction AND change the sign!` },
          { text: `${den}/${num}`, gapId: 'slope_formula', whyWrong: `You flipped the fraction nicely, but forgot to flip the sign to NEGATIVE!` },
          { text: `−${num}/${den}`, gapId: 'slope_formula', whyWrong: `You flipped the sign, but forgot to flip the fraction (reciprocal)!` }
        ]),
        steps: [
          `Read the original slope from y = mx + b: m = ${num}/${den}.`,
          `Take the reciprocal: ${den}/${num}.`,
          `Flip the sign (negative reciprocal): −${den}/${num}.`
        ]
      };
    }
    // Tier 5: Standard form Ax + By = C → slope + y-intercept
    const a = pick([2, 3, 4, 6]);
    const b = pick([2, 3, 4]);
    const c = b * randInt(3, 7);
    const slopeStr = fracStr(-a, b);
    return {
      domain: 'coord_geo', tier: 5, lessonId: 'slope_formula',
      prompt: `What is the slope of the line  ${a}x + ${b}y = ${c}?`,
      hint: `Rearrange into y = mx + b by subtracting ${a}x and dividing by ${b}. (Shortcut: m = −A/B).`,
      choices: buildChoices(slopeStr, [
        { text: fracStr(a, b), gapId: 'slope_formula', whyWrong: `Watch the sign! Moving +${a}x to the right side makes it −${a}x, so slope = −${a}/${b} = ${slopeStr}.` },
        { text: `${a}`, gapId: 'slope_formula', whyWrong: `The coefficient of x is only the slope AFTER y is completely isolated (y = mx + b)!` },
        { text: fracStr(-b, a), gapId: 'slope_formula', whyWrong: `Divide by ${b} (the coefficient of y), not by ${a}: m = −A/B = ${slopeStr}.` }
      ]),
      steps: [
        `Subtract ${a}x from both sides: ${b}y = −${a}x + ${c}.`,
        `Divide every term by ${b}: y = (${slopeStr})x + ${c / b}.`,
        `The slope m is ${slopeStr}.`
      ]
    };
  }

  function genPlaneGeo(tier) {
    if (tier === 1) {
      // Triangle angle sum
      const a = randInt(35, 75);
      const b = randInt(35, 75);
      const c = 180 - a - b;
      return {
        domain: 'plane_geo', tier, lessonId: 'triangle_area_angles',
        prompt: `Two angles of a triangle measure ${a}° and ${b}°. What is the measure of the third angle?`,
        hint: `All 3 interior angles of any triangle always add up to 180°.`,
        choices: buildChoices(`${c}°`, [
          { text: `${a + b}°`, gapId: 'triangle_area_angles', whyWrong: `${a + b}° is the sum of the first two angles—now subtract that from 180°!` },
          { text: `${360 - a - b}°`, gapId: 'triangle_area_angles', whyWrong: `A triangle's angles sum to 180° (360° is for a quadrilateral or full circle).` },
          { text: `${Math.abs(90 - a)}°`, gapId: 'triangle_area_angles', whyWrong: `Subtract BOTH ${a}° and ${b}° from 180°: 180 − ${a + b} = ${c}°.` }
        ]),
        steps: [
          `Add the two known angles: ${a}° + ${b}° = ${a + b}°.`,
          `Subtract from 180°: 180° − ${a + b}° = ${c}°.`
        ]
      };
    }
    if (tier === 2) {
      // Area of a triangle (classic forgot-to-divide-by-2 check)
      const base = randInt(3, 9) * 2;
      const height = randInt(4, 11);
      const area = (base * height) / 2;
      return {
        domain: 'plane_geo', tier, lessonId: 'triangle_area_angles',
        prompt: `What is the area of a triangle with base ${base} inches and height ${height} inches?`,
        hint: `Triangle Area = ½ × base × height.`,
        choices: buildChoices(`${area} sq in`, [
          { text: `${base * height} sq in`, gapId: 'triangle_area_angles', whyWrong: `You calculated base × height (${base * height}), which is a rectangle's area! A triangle is HALF of that: divide by 2!` },
          { text: `${base + height} sq in`, gapId: 'triangle_area_angles', whyWrong: `Area multiplies dimensions (½ · b · h), rather than adding them.` },
          { text: `${area + base} sq in`, gapId: 'triangle_area_angles', whyWrong: `Use ½ × ${base} × ${height} = ${area}.` }
        ]),
        steps: [
          `Formula: Area = ½ × base × height.`,
          `Multiply base × height = ${base} × ${height} = ${base * height}.`,
          `Divide by 2 → ${area} sq in.`
        ]
      };
    }
    if (tier === 3) {
      // Pythagorean theorem (right triangle missing leg or hyp)
      const triples = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15]];
      const [a, b, c] = pick(triples);
      const findLeg = Math.random() < 0.5;
      if (!findLeg) {
        return {
          domain: 'plane_geo', tier, lessonId: 'triangle_area_angles',
          prompt: `A right triangle has legs of lengths ${a} and ${b}. What is the length of the hypotenuse?`,
          diagram: svgRightTriangle(`${a}`, `${b}`, 'x', ''),
          hint: `Use a² + b² = c² (or recognize a Pythagorean triple!).`,
          choices: buildChoices(c, [
            { text: a + b, gapId: 'triangle_area_angles', whyWrong: `In a right triangle, a + b ≠ c! You must square both legs first: ${a}² + ${b}² = c².` },
            { text: c * c, gapId: 'triangle_area_angles', whyWrong: `${c * c} is c² — don't forget to take the square root √${c * c} = ${c}!` },
            { text: Math.round((a * b) / 2), gapId: 'triangle_area_angles', whyWrong: `${Math.round((a * b) / 2)} is the triangle's AREA, not its hypotenuse!` }
          ]),
          steps: [
            `Plug into a² + b² = c²: ${a}² + ${b}² = ${a * a} + ${b * b} = ${c * c}.`,
            `Take the square root: c = √${c * c} = ${c}.`
          ]
        };
      }
      return {
        domain: 'plane_geo', tier, lessonId: 'triangle_area_angles',
        prompt: `A right triangle has a hypotenuse of ${c} and one leg of ${a}. What is the length of the other leg?`,
        diagram: svgRightTriangle(`${a}`, 'x', `${c}`, ''),
        hint: `Since you already have the hypotenuse c = ${c}, SUBTRACT: b² = c² − a².`,
        choices: buildChoices(b, [
          { text: c - a, gapId: 'triangle_area_angles', whyWrong: `You subtracted ${c} − ${a} directly—square them first! b² = ${c}² − ${a}².` },
          { text: Math.round(Math.hypot(a, c)), gapId: 'triangle_area_angles', whyWrong: `A leg MUST be shorter than the hypotenuse (${c})! Subtract a² from c² instead of adding.` },
          { text: b * b, gapId: 'triangle_area_angles', whyWrong: `${b * b} is b² — take the square root to get b = ${b}!` }
        ]),
        steps: [
          `Set up ${a}² + b² = ${c}² → ${a * a} + b² = ${c * c}.`,
          `Subtract ${a * a}: b² = ${b * b}.`,
          `Take the square root: b = ${b}.`
        ]
      };
    }
    if (tier === 4) {
      // Circle area given DIAMETER (classic ACT trap!)
      const r = randInt(3, 8);
      const d = r * 2;
      return {
        domain: 'plane_geo', tier, lessonId: 'circles_area_circ',
        prompt: `A circle has a DIAMETER of ${d} cm. What is its area?`,
        diagram: svgCircle(`d = ${d}`, true),
        hint: `Careful! The problem gives the DIAMETER. Cut it in half first to get the radius r, then compute πr².`,
        choices: buildChoices(`${r * r}π`, [
          { text: `${d * d}π`, gapId: 'circles_area_circ', whyWrong: `Classic ACT diameter trap! You squared the diameter (${d}²) instead of cutting it in half to radius r = ${r} first.` },
          { text: `${d}π`, gapId: 'circles_area_circ', whyWrong: `${d}π is the CIRCUMFERENCE (πd), not the Area (πr²)!` },
          { text: `${r * 2}π`, gapId: 'circles_area_circ', whyWrong: `Area squares the radius (r² = ${r * r}), rather than multiplying by 2.` }
        ]),
        steps: [
          `Convert diameter to radius: r = ${d} ÷ 2 = ${r}.`,
          `Use Area = πr² = π(${r})² = ${r * r}π.`
        ]
      };
    }
    // Tier 5: Sector / Arc length or Similar Triangles ratio
    const r = pick([6, 9, 12]);
    const angle = pick([60, 90, 120]);
    const frac = 360 / angle;
    const ansArea = (r * r) / frac;
    return {
      domain: 'plane_geo', tier: 5, lessonId: 'circles_area_circ',
      prompt: `In a circle of radius ${r}, what is the area of a sector with a central angle of ${angle}°?`,
      diagram: svgCircle(`r = ${r}, ${angle}°`, false),
      hint: `A sector is just a fraction of the full circle: (${angle}° / 360°) × πr².`,
      choices: buildChoices(`${ansArea}π`, [
        { text: `${r * r}π`, gapId: 'circles_area_circ', whyWrong: `${r * r}π is the ENTIRE circle's area. Multiply by the fraction ${angle}/360 = 1/${frac}!` },
        { text: `${(2 * r) / frac}π`, gapId: 'circles_area_circ', whyWrong: `You found the ARC LENGTH (fraction of circumference 2πr) instead of SECTOR AREA (fraction of πr²)!` },
        { text: `${ansArea * 2}π`, gapId: 'circles_area_circ', whyWrong: `Check the fraction: ${angle}° / 360° = 1/${frac}, so (${r * r}π) / ${frac} = ${ansArea}π.` }
      ]),
      steps: [
        `Find the fraction of the circle: ${angle}° / 360° = 1/${frac}.`,
        `Find full circle area: πr² = π(${r})² = ${r * r}π.`,
        `Multiply: (1/${frac}) × ${r * r}π = ${ansArea}π.`
      ]
    };
  }

  function genTrigStats(tier) {
    // Mix in 2x2 Matrices & Determinants at Tiers 4-5!
    if (tier >= 4 && Math.random() < 0.45) return genMatrix(tier);
    if (tier === 1) {
      // Simple probability
      const red = randInt(2, 5);
      const blue = randInt(3, 6);
      const green = randInt(1, 4);
      const total = red + blue + green;
      const ans = fracStr(red, total);
      return {
        domain: 'trig_stats', tier, lessonId: 'probability_stats',
        prompt: `A treasure chest holds ${red} ruby gems, ${blue} sapphire gems, and ${green} emerald gems. If you pull 1 gem at random, what is the probability it is a RUBY?`,
        hint: `Probability = (Number of rubies) ÷ (TOTAL gems in the chest).`,
        choices: buildChoices(ans, [
          { text: fracStr(red, blue + green), gapId: 'probability_stats', whyWrong: `You put rubies over OTHER gems instead of TOTAL gems! Include the ${red} rubies in the denominator (${total}).` },
          { text: fracStr(1, red), gapId: 'probability_stats', whyWrong: `The denominator must be the total number of gems (${total}), and numerator is how many are rubies (${red}).` },
          { text: fracStr(blue, total), gapId: 'probability_stats', whyWrong: `Careful! ${blue}/${total} is the probability of a sapphire, not a ruby.` }
        ]),
        steps: [
          `Count total gems: ${red} + ${blue} + ${green} = ${total}.`,
          `Divide favorable (ruby = ${red}) by total (${total}) → ${ans}.`
        ]
      };
    }
    if (tier === 2) {
      // Median (unsorted!)
      const vals = [randInt(3, 6), randInt(7, 10), randInt(11, 14), randInt(15, 19), randInt(20, 26)];
      const median = vals[2];
      const unsorted = [vals[3], vals[0], vals[4], vals[1], vals[2]];
      const mean = Math.round((vals.reduce((s, v) => s + v, 0) / 5) * 10) / 10;
      return {
        domain: 'trig_stats', tier, lessonId: 'probability_stats',
        prompt: `What is the MEDIAN of the following ACT quiz scores:  ${unsorted.join(', ')}?`,
        hint: `ALWAYS sort the numbers from smallest to largest first, then pick the middle number!`,
        choices: buildChoices(median, [
          { text: unsorted[2], gapId: 'probability_stats', whyWrong: `You picked the middle number (${unsorted[2]}) WITHOUT sorting the list first! Always sort smallest → largest.` },
          { text: mean === median ? median + 2 : mean, gapId: 'probability_stats', whyWrong: `That's the MEAN (average), not the MEDIAN (middle value after sorting)!` },
          { text: vals[4] - vals[0], gapId: 'probability_stats', whyWrong: `Largest minus smallest is the RANGE, not the median.` }
        ]),
        steps: [
          `Sort from smallest to largest: ${vals.join(', ')}.`,
          `Pick the middle (3rd of 5) number → ${median}.`
        ]
      };
    }
    if (tier === 3) {
      // SOH-CAH-TOA right triangle trig!
      const triples = [[3, 4, 5], [5, 12, 13], [8, 15, 17]];
      const [opp, adj, hyp] = pick(triples);
      const fn = pick(['sin', 'cos', 'tan']);
      const ans = fn === 'sin' ? `${opp}/${hyp}` : (fn === 'cos' ? `${adj}/${hyp}` : `${opp}/${adj}`);
      const distractors = [];
      if (fn !== 'sin') distractors.push({ text: `${opp}/${hyp}`, gapId: 'soh_cah_toa', whyWrong: `${opp}/${hyp} is Opposite/Hypotenuse, which is sin(θ), not ${fn}(θ)!` });
      if (fn !== 'cos') distractors.push({ text: `${adj}/${hyp}`, gapId: 'soh_cah_toa', whyWrong: `${adj}/${hyp} is Adjacent/Hypotenuse, which is cos(θ), not ${fn}(θ)!` });
      if (fn !== 'tan') distractors.push({ text: `${opp}/${adj}`, gapId: 'soh_cah_toa', whyWrong: `${opp}/${adj} is Opposite/Adjacent, which is tan(θ), not ${fn}(θ)!` });
      distractors.push({ text: `${adj}/${opp}`, gapId: 'soh_cah_toa', whyWrong: `Double-check SOH-CAH-TOA: you inverted the fraction!` });
      return {
        domain: 'trig_stats', tier, lessonId: 'soh_cah_toa',
        prompt: `In the right triangle shown, what is ${fn}(θ)?`,
        diagram: svgRightTriangle(`${opp}`, `${adj}`, `${hyp}`, 'θ'),
        hint: `Remember SOH-CAH-TOA: sin = Opp/Hyp, cos = Adj/Hyp, tan = Opp/Adj.`,
        choices: buildChoices(ans, distractors),
        steps: [
          `From angle θ: Opposite = ${opp}, Adjacent = ${adj}, Hypotenuse = ${hyp}.`,
          fn === 'sin' ? `SOH: sin(θ) = Opposite / Hypotenuse = ${opp}/${hyp}.`
            : fn === 'cos' ? `CAH: cos(θ) = Adjacent / Hypotenuse = ${adj}/${hyp}.`
            : `TOA: tan(θ) = Opposite / Adjacent = ${opp}/${adj}.`
        ]
      };
    }
    if (tier === 4) {
      // ACT Average "needed score on next test" problem!
      const n = 3;
      const curAvg = pick([80, 82, 84, 86]);
      const targetAvg = curAvg + pick([2, 3, 4]);
      const needed = targetAvg * (n + 1) - curAvg * n;
      return {
        domain: 'trig_stats', tier, lessonId: 'probability_stats',
        prompt: `Maya has an average score of ${curAvg} on her first ${n} math tests. What score does she need on her 4th test to raise her overall average to ${targetAvg}?`,
        hint: `ACT Sum Shortcut: Total needed for 4 tests = 4 × ${targetAvg}. Subtract her current total (3 × ${curAvg})!`,
        choices: buildChoices(needed, [
          { text: targetAvg + (targetAvg - curAvg), gapId: 'probability_stats', whyWrong: `The 4th test has to pull up ALL 3 previous tests too! Compute (4 × ${targetAvg}) − (3 × ${curAvg}).` },
          { text: targetAvg, gapId: 'probability_stats', whyWrong: `Scoring ${targetAvg} would only bring the average halfway between ${curAvg} and ${targetAvg}.` },
          { text: needed - 4, gapId: 'probability_stats', whyWrong: `Check the sum: 4 × ${targetAvg} = ${targetAvg * 4}, minus 3 × ${curAvg} = ${curAvg * 3} gives ${needed}.` }
        ]),
        steps: [
          `Current total for 3 tests: 3 × ${curAvg} = ${curAvg * 3}.`,
          `Target total for 4 tests: 4 × ${targetAvg} = ${targetAvg * 4}.`,
          `Needed 4th test score: ${targetAvg * 4} − ${curAvg * 3} = ${needed}.`
        ]
      };
    }
    // Tier 5: Degrees to Radians OR Independent Probability
    if (Math.random() < 0.5) {
      const pair = pick([
        { deg: 120, rad: '2π/3', wrong1: '3π/2', wrong2: 'π/3', wrong3: '4π/3' },
        { deg: 150, rad: '5π/6', wrong1: '6π/5', wrong2: '3π/4', wrong3: '2π/3' },
        { deg: 225, rad: '5π/4', wrong1: '4π/5', wrong2: '3π/4', wrong3: '7π/4' },
        { deg: 300, rad: '5π/3', wrong1: '3π/5', wrong2: '4π/3', wrong3: '7π/6' }
      ]);
      return {
        domain: 'trig_stats', tier: 5, lessonId: 'soh_cah_toa',
        prompt: `What is ${pair.deg}° expressed in radians?`,
        hint: `To convert degrees to radians, multiply by π / 180° and reduce the fraction.`,
        choices: buildChoices(pair.rad, [
          { text: pair.wrong1, gapId: 'soh_cah_toa', whyWrong: `You inverted the ratio! Multiply degrees by π/180 (not 180/π).` },
          { text: pair.wrong2, gapId: 'soh_cah_toa', whyWrong: `Reduce ${pair.deg}/180 carefully: divide top and bottom by their GCF.` },
          { text: pair.wrong3, gapId: 'soh_cah_toa', whyWrong: `Check: ${pair.deg} × (π/180) simplifies to ${pair.rad}.` }
        ]),
        steps: [
          `Multiply by π / 180: ${pair.deg}π / 180.`,
          `Reduce the fraction → ${pair.rad}.`
        ]
      };
    }
    // Independent AND probability
    const p1n = 1, p1d = pick([3, 4, 5]);
    const p2n = 1, p2d = pick([2, 3, 4]);
    const ans = fracStr(p1n * p2n, p1d * p2d);
    const sumTrap = fracStr(p1n * p2d + p2n * p1d, p1d * p2d);
    return {
      domain: 'trig_stats', tier: 5, lessonId: 'probability_stats',
      prompt: `Event A has probability ${p1n}/${p1d} and independent Event B has probability ${p2n}/${p2d}. What is the probability that BOTH A and B occur?`,
      hint: `For independent events ("A AND B"), MULTIPLY their probabilities!`,
      choices: buildChoices(ans, [
        { text: sumTrap, gapId: 'probability_stats', whyWrong: `You ADDED the probabilities! "A AND B" (both happening) means MULTIPLY: (${p1n}/${p1d}) × (${p2n}/${p2d}).` },
        { text: fracStr(1, p1d + p2d), gapId: 'probability_stats', whyWrong: `Multiply denominators (${p1d} × ${p2d} = ${p1d * p2d}), don't add them!` },
        { text: fracStr(2, p1d * p2d), gapId: 'probability_stats', whyWrong: `Multiply numerators (1 × 1 = 1) and denominators (${p1d} × ${p2d} = ${p1d * p2d}).` }
      ]),
      steps: [
        `Since A and B are independent, P(A and B) = P(A) × P(B).`,
        `Multiply: (${p1n}/${p1d}) × (${p2n}/${p2d}) = ${ans}.`
      ]
    };
  }

  const GENERATORS = {
    number: genNumber,
    algebra1: genAlgebra1,
    algebra2: genAlgebra2,
    coord_geo: genCoordGeo,
    plane_geo: genPlaneGeo,
    trig_stats: genTrigStats
  };

  // ==================== ADAPTIVE PLAYER PROFILE ====================
  function createFreshProfile() {
    const domains = {};
    Object.keys(DOMAINS).forEach(k => {
      domains[k] = {
        tier: 1,        // Starts at Easy Tier 1!
        mastery: 10,    // 0..100
        streak: 0,      // +1 per right, resets on miss
        missesInRow: 0, // triggers drop-down + basics help
        solved: 0,
        correct: 0
      };
    });
    return {
      domains,
      gaps: {},         // gapId -> { count, lastMissedAt, resolvedCount }
      totalSolved: 0,
      totalCorrect: 0,
      totalTimeMs: 0,
      streak: 0,
      bestStreak: 0
    };
  }

  let profile = createFreshProfile();

  function loadProfile(saved) {
    if (!saved || !saved.domains) {
      profile = createFreshProfile();
      return;
    }
    const fresh = createFreshProfile();
    Object.keys(fresh.domains).forEach(k => {
      if (saved.domains[k]) fresh.domains[k] = { ...fresh.domains[k], ...saved.domains[k] };
    });
    profile = {
      ...fresh,
      ...saved,
      domains: fresh.domains,
      gaps: saved.gaps || {}
    };
  }

  function getProfile() {
    return profile;
  }

  function resetProfile() {
    profile = createFreshProfile();
  }

  // Pick the best adaptive domain (prioritizes detected gaps or lowest-mastery domain)
  function chooseAdaptiveDomain() {
    const topGaps = getTopGaps(2);
    if (topGaps.length > 0 && Math.random() < 0.6) {
      return LESSONS[topGaps[0].gapId].domain;
    }
    const keys = Object.keys(DOMAINS);
    // Weight toward lower-mastery domains so the player builds well-rounded ACT prep
    keys.sort((a, b) => profile.domains[a].mastery - profile.domains[b].mastery);
    return Math.random() < 0.65 ? keys[0] : pick(keys);
  }

  function generateQuestion(domainHint, forcedTier = null) {
    let domain = domainHint;
    if (!domain || domain === 'adaptive') {
      domain = chooseAdaptiveDomain();
    } else if (domain === 'algebra2_coord') {
      domain = Math.random() < 0.5 ? 'algebra2' : 'coord_geo';
    }
    if (!GENERATORS[domain]) domain = 'algebra1';

    const dState = profile.domains[domain];
    const tier = forcedTier !== null ? Math.max(1, Math.min(5, forcedTier)) : dState.tier;
    const q = GENERATORS[domain](tier);
    q.domainName = DOMAINS[domain].name;
    q.tierLabel = ['', 'Easy • Basics', 'Foundational', 'ACT Core', 'ACT Advanced', 'ACT 32–36 Boss'][tier];
    return q;
  }

  // Record answer, adapt difficulty up/down, and update diagnostic gaps!
  function recordAnswer(question, selectedChoice, elapsedMs) {
    const d = profile.domains[question.domain];
    profile.totalSolved += 1;
    profile.totalTimeMs += Math.min(elapsedMs, 180000);
    d.solved += 1;

    const result = {
      isCorrect: selectedChoice.isCorrect,
      tierChanged: 0, // +1 promoted, -1 eased
      detectedGapId: null,
      diagnosisText: '',
      recommendLesson: false
    };

    if (selectedChoice.isCorrect) {
      profile.totalCorrect += 1;
      profile.streak += 1;
      if (profile.streak > profile.bestStreak) profile.bestStreak = profile.streak;

      d.correct += 1;
      d.streak += 1;
      d.missesInRow = 0;

      // Mastery climbs faster on higher tiers
      const gain = 6 + question.tier * 3;
      d.mastery = Math.min(100, d.mastery + gain);

      // Heal gap if this question's lesson was a tracked gap
      if (profile.gaps[question.lessonId] && profile.gaps[question.lessonId].count > 0) {
        profile.gaps[question.lessonId].count = Math.max(0, profile.gaps[question.lessonId].count - 1);
        profile.gaps[question.lessonId].resolvedCount = (profile.gaps[question.lessonId].resolvedCount || 0) + 1;
      }

      // Adaptive Step-Up: 2 correct in a row at current tier → level up difficulty!
      if (d.streak >= 2 && d.tier < 5) {
        d.tier += 1;
        d.streak = 0;
        result.tierChanged = 1;
      }
    } else {
      profile.streak = 0;
      d.streak = 0;
      d.missesInRow += 1;
      d.mastery = Math.max(5, d.mastery - 5);

      const gapId = selectedChoice.gapId || question.lessonId;
      result.detectedGapId = gapId;
      result.diagnosisText = selectedChoice.whyWrong || 'Let\'s review the steps for this concept!';

      if (!profile.gaps[gapId]) {
        profile.gaps[gapId] = { count: 0, resolvedCount: 0, lastMissedAt: Date.now() };
      }
      profile.gaps[gapId].count += 1;
      profile.gaps[gapId].lastMissedAt = Date.now();

      // Adaptive Step-Down: makes questions gentler when struggling
      if (d.tier > 1 && d.missesInRow >= 1) {
        d.tier -= 1;
        result.tierChanged = -1;
      }
      if (d.missesInRow >= 1 || profile.gaps[gapId].count >= 2) {
        result.recommendLesson = true;
      }
    }

    return result;
  }

  function markLessonCompleted(lessonId) {
    if (profile.gaps[lessonId]) {
      profile.gaps[lessonId].count = Math.max(0, profile.gaps[lessonId].count - 1);
      profile.gaps[lessonId].resolvedCount = (profile.gaps[lessonId].resolvedCount || 0) + 1;
    }
    const lesson = LESSONS[lessonId];
    if (lesson && profile.domains[lesson.domain]) {
      profile.domains[lesson.domain].mastery = Math.min(100, profile.domains[lesson.domain].mastery + 4);
    }
  }

  function getTopGaps(limit = 4) {
    return Object.entries(profile.gaps)
      .filter(([id, g]) => g.count > 0 && LESSONS[id])
      .sort((a, b) => b[1].count - a[1].count || b[1].lastMissedAt - a[1].lastMissedAt)
      .slice(0, limit)
      .map(([gapId, data]) => ({
        gapId,
        misses: data.count,
        lesson: LESSONS[gapId]
      }));
  }

  function getEstimatedActScore() {
    let weighted = 0;
    Object.values(DOMAINS).forEach(dom => {
      const st = profile.domains[dom.id];
      // Combine mastery & achieved tier into 0..1 readiness
      const tierFactor = (st.tier - 1) / 4; // 0..1
      const readiness = (st.mastery / 100) * 0.72 + tierFactor * 0.28;
      weighted += readiness * dom.actWeight;
    });
    // ACT Math ranges from 12 (baseline) to 36 (perfect)
    return Math.max(12, Math.min(36, Math.round(12 + weighted * 24)));
  }

  function getActRank(score) {
    if (score >= 34) return 'ACT Math Grandmaster (99th %ile)';
    if (score >= 30) return 'Diamond Scholar (Top 5%)';
    if (score >= 26) return 'Gold Strategist (College Ready+)';
    if (score >= 22) return 'Iron Problem-Solver (Above Avg)';
    if (score >= 18) return 'Stone Miner (Building Foundations)';
    return 'Apprentice Explorer (Just Starting!)';
  }

  const TOPIC_GENERATORS = {
    logarithms: () => genLogarithm(4),
    complex_numbers: () => genComplexNumber(4),
    matrices: () => genMatrix(4),
    conic_sections: () => genConicSection(4),
    sequences_series: () => genSequence(3)
  };

  function generateTopicQuestion(topicId) {
    const fn = TOPIC_GENERATORS[topicId];
    const q = fn ? fn() : generateQuestion('adaptive');
    q.domainName = DOMAINS[q.domain].name;
    q.tierLabel = ['', 'Easy • Basics', 'Foundational', 'ACT Core', 'ACT Advanced', 'ACT 32–36 Boss'][q.tier || 4];
    return q;
  }

  // Generate a balanced 12-question Timed Mini-ACT Practice Exam (12 minutes = exact ACT 1 min/q pace!)
  // Escalates smoothly from Easy (Q1-4) -> Medium (Q5-8) -> ACT Hard/Advanced (Q9-12) across all 6 domains
  function generateMiniActExam() {
    const blueprint = [
      { domain: 'number', tier: 1 },
      { domain: 'algebra1', tier: 1 },
      { domain: 'plane_geo', tier: 1 },
      { domain: 'coord_geo', tier: 2 },
      { domain: 'trig_stats', tier: 2 },
      { domain: 'algebra2', tier: 2 },
      { domain: 'number', tier: 3 },
      { domain: 'plane_geo', tier: 3 },
      { domain: 'algebra1', tier: 4 },
      { topic: pick(['conic_sections', 'logarithms']) },
      { topic: pick(['matrices', 'complex_numbers']) },
      { topic: pick(['logarithms', 'complex_numbers', 'sequences_series', 'conic_sections']) }
    ];
    return blueprint.map((bp, i) => {
      const q = bp.topic ? generateTopicQuestion(bp.topic) : generateQuestion(bp.domain, bp.tier);
      q.examNumber = i + 1;
      return q;
    });
  }

  // Convert raw Mini-ACT Exam score (0..12) into realistic ACT scaled score (12..36)
  function scaleMiniExamScore(correctCount, totalCount) {
    const ratio = correctCount / Math.max(1, totalCount);
    return Math.max(12, Math.min(36, Math.round(12 + ratio * 24)));
  }

  return {
    DOMAINS,
    LESSONS,
    loadProfile,
    getProfile,
    resetProfile,
    generateQuestion,
    generateTopicQuestion,
    generateMiniActExam,
    scaleMiniExamScore,
    recordAnswer,
    markLessonCompleted,
    getTopGaps,
    getEstimatedActScore,
    getActRank
  };
})();
