/**
 * SAHAYA — AI Teaching Assistant Engine
 *
 * Separates the deterministic rule-based recommendation engine from optional AI pedagogical support.
 * - When no backend AI proxy is configured, runs in a clearly labelled, transparent DEMO MODE.
 * - Generates concept-specific explanations, targeted practice activities, follow-up MCQs,
 *   and small-group classroom interventions based on observed assessment patterns.
 * - Never transmits student names or personally identifiable information (PII).
 */

const CONCEPT_PEDAGOGY_LIBRARY = {
  'Unlike Fraction Addition': {
    analogy:
      'Think of fractions with different denominators like measuring in two different units—such as adding 2 metres and 50 centimetres. Before we can add the numbers together, we must convert them into the same unit (a common denominator).',
    commonMisconception:
      'Students frequently add the numerators together and add the denominators together (e.g., writing 2/3 + 1/6 = 3/9) because whole-number addition habits carry over.',
    workedExample: {
      problem: 'Add 2/3 + 1/6',
      steps: [
        'Step 1: Check the denominators (3 and 6). Since they are different, we cannot add the numerators yet.',
        'Step 2: Find a common multiple of 3 and 6. Since 6 is a multiple of 3 (3 × 2 = 6), use 6 as the common denominator.',
        'Step 3: Convert 2/3 into sixths by multiplying top and bottom by 2: (2 × 2)/(3 × 2) = 4/6.',
        'Step 4: Now add the like fractions: 4/6 + 1/6 = 5/6.'
      ]
    },
    activities: {
      relearn:
        'Paper Strip Folding Station: Give students two identical rectangular paper strips. Fold one into 3 equal parts (shade 2/3) and the other into 6 equal parts (shade 1/6). Fold the 3-part strip in half again so students visually see 2/3 become 4/6 before counting total sixths.',
      practise:
        'Denominator Match Pair Work: Students work in pairs with 6 fraction addition cards where one denominator is a direct multiple of the other (halves/quarters, thirds/sixths, fifths/tenths). Partner A finds the common denominator; Partner B completes the addition.',
      advance:
        'Three-Fraction Recipe Challenge: Students solve multi-step word problems combining three unlike fractions (e.g., 1/2 + 1/3 + 1/6) and explain why their sum equals 1 whole.'
    },
    followUpQuestions: [
      {
        text: 'Before adding 1/4 and 3/8, how can we rewrite 1/4 so both fractions have the same denominator?',
        options: ['1/8', '2/8', '4/8', '3/4'],
        correctOptionIndex: 1,
        conceptTag: 'Unlike Fraction Addition',
        isFundamental: true
      },
      {
        text: 'What is the sum of 1/2 and 3/10?',
        options: ['4/12', '4/5', '4/10', '3/20'],
        correctOptionIndex: 1,
        conceptTag: 'Unlike Fraction Addition',
        isFundamental: false
      },
      {
        text: 'A gardener waters 2/5 of a field in the morning and 3/10 in the evening. What fraction of the field is watered?',
        options: ['5/15', '7/10', '5/10', '6/50'],
        correctOptionIndex: 1,
        conceptTag: 'Unlike Fraction Addition',
        isFundamental: false
      }
    ]
  },

  'Equivalent Fractions': {
    analogy:
      'Cutting a roti into 2 equal pieces and eating 1 piece gives the exact same amount of food as cutting the same roti into 4 equal pieces and eating 2 pieces (1/2 = 2/4). The number of pieces changes, but the portion stays equal.',
    commonMisconception:
      'Students often add the same number to numerator and denominator (thinking 3/4 = 5/6 by adding 2 to both) instead of multiplying or dividing by a common factor.',
    workedExample: {
      problem: 'Find an equivalent fraction for 3/4 with denominator 12',
      steps: [
        'Step 1: Look at how the denominator changed: from 4 to 12.',
        'Step 2: Ask: "4 multiplied by what number gives 12?" -> 4 × 3 = 12.',
        'Step 3: Multiply the numerator by the exact same number (3): 3 × 3 = 9.',
        'Step 4: The equivalent fraction is 9/12.'
      ]
    },
    activities: {
      relearn:
        'Chalkboard Number Line Overlay: Draw two parallel 0-to-1 number lines on the board—one marked in fourths, one in twelfths. Have students trace vertical lines showing where marks line up exactly.',
      practise:
        'Missing Number Dominoes: Provide 8 equivalent fraction equations with a blank box (e.g., 2/5 = [ ]/15) for students to solve and verify using multiplication tables.',
      advance:
        'Odd-One-Out Justification: Present sets of four fractions (e.g., 6/9, 10/15, 8/12, 9/12) and ask students to identify which one is not equivalent and prove why.'
    },
    followUpQuestions: [
      {
        text: 'Which number should replace the question mark to make the fractions equivalent: 2/5 = ?/20',
        options: ['4', '8', '15', '10'],
        correctOptionIndex: 1,
        conceptTag: 'Equivalent Fractions',
        isFundamental: true
      },
      {
        text: 'What is the simplest form of the fraction 12/18?',
        options: ['6/9', '2/3', '3/4', '4/6'],
        correctOptionIndex: 1,
        conceptTag: 'Equivalent Fractions',
        isFundamental: true
      },
      {
        text: 'Which pair of fractions below are equivalent?',
        options: ['2/3 and 3/4', '4/6 and 6/9', '1/2 and 2/3', '3/5 and 5/8'],
        correctOptionIndex: 1,
        conceptTag: 'Equivalent Fractions',
        isFundamental: false
      }
    ]
  },

  'Fraction-Decimal Conversion': {
    analogy:
      'Decimals are simply special fractions whose denominators are powers of 10 (10, 100, 1000)—just like paise and rupees where 50 paise is 50/100 of a rupee, written as 0.50.',
    commonMisconception:
      'Students often write the numerator and denominator directly after the decimal point (writing 3/5 as 0.35 or 1/4 as 0.14) instead of converting to tenths or hundredths first.',
    workedExample: {
      problem: 'Convert 3/5 into a decimal',
      steps: [
        'Step 1: Check if the denominator (5) can easily be turned into 10 or 100.',
        'Step 2: Multiply numerator and denominator by 2 so the denominator becomes 10: (3 × 2)/(5 × 2) = 6/10.',
        'Step 3: Read 6/10 in place value terms: "six tenths".',
        'Step 4: Write six tenths in decimal form: 0.6.'
      ]
    },
    activities: {
      relearn:
        '10x10 Grid Shading: Use a 100-square grid on chart paper. Ask students to shade 1/4 of the grid (25 squares) and count the tenths and hundredths to see why 1/4 = 0.25 and not 0.14.',
      practise:
        'Benchmark Conversion Sprint: Practice converting denominator families of 2, 4, 5, 20, and 25 into tenths or hundredths and then into decimals.',
      advance:
        'Mixed Unit Word Problems: Combine distances or weights given partly in decimals (1.75 kg) and partly in fractions (3/4 kg) and solve both ways.'
    },
    followUpQuestions: [
      {
        text: 'When converting 4/5 to a decimal by first making the denominator 10, what fraction do we get?',
        options: ['4/10', '8/10', '5/10', '45/10'],
        correctOptionIndex: 1,
        conceptTag: 'Fraction-Decimal Conversion',
        isFundamental: true
      },
      {
        text: 'Which decimal is equivalent to 1/4?',
        options: ['0.14', '0.25', '0.4', '0.41'],
        correctOptionIndex: 1,
        conceptTag: 'Fraction-Decimal Conversion',
        isFundamental: true
      },
      {
        text: 'A bottle holds 1.5 litres of water. If 1/4 litre is poured out, how much water remains?',
        options: ['1.10 L', '1.25 L', '1.00 L', '1.40 L'],
        correctOptionIndex: 1,
        conceptTag: 'Fraction-Decimal Conversion',
        isFundamental: false
      }
    ]
  },

  'Pressure & Surface Area': {
    analogy:
      'Think of walking on soft sand in flat sports shoes versus pointed heels. Your body weight (Force) is the same, but when that force is spread over a larger sole area, the pressure is lower so you do not sink.',
    commonMisconception:
      'Students frequently confuse Force and Pressure, or multiply Force × Area instead of dividing Force / Area.',
    workedExample: {
      problem: 'A box weighing 60 N rests on a table with a contact area of 3 m². Find the pressure.',
      steps: [
        'Step 1: Recall the relationship: Pressure = Force ÷ Area.',
        'Step 2: Identify Force = 60 N and Area = 3 m².',
        'Step 3: Divide 60 by 3: 60 ÷ 3 = 20.',
        'Step 4: Write the unit of pressure (N/m² or Pascals): 20 Pa.'
      ]
    },
    activities: {
      relearn:
        'Pencil & Palm Classroom Demo: Have students gently press a blunt pencil between their two palms—one palm touches the flat eraser end (large area) and the other touches the tip (small area). Notice the force is identical, yet the smaller area feels much higher pressure.',
      practise:
        'Formula Triangle Practice: Solve 5 numerical problems finding Pressure when Force and Area are given, keeping units in N and m².',
      advance:
        'Brick Orientation Problem: A rectangular brick measures 20 cm × 10 cm × 5 cm. Determine which face placed on the table exerts the maximum and minimum pressure.'
    },
    followUpQuestions: [
      {
        text: 'If the force applied stays constant and the surface area is doubled, what happens to the pressure?',
        options: ['Pressure doubles', 'Pressure becomes half', 'Pressure stays the same', 'Pressure becomes zero'],
        correctOptionIndex: 1,
        conceptTag: 'Pressure & Surface Area',
        isFundamental: true
      },
      {
        text: 'A force of 80 N acts on an area of 4 m². What is the pressure produced?',
        options: ['320 Pa', '20 Pa', '84 Pa', '0.05 Pa'],
        correctOptionIndex: 1,
        conceptTag: 'Pressure & Surface Area',
        isFundamental: false
      },
      {
        text: 'Why do cutting tools like knives have sharp (thin) edges?',
        options: [
          'To increase contact area and reduce pressure',
          'To decrease contact area so a small force creates large pressure',
          'To increase the weight of the knife',
          'To prevent rusting'
        ],
        correctOptionIndex: 1,
        conceptTag: 'Pressure & Surface Area',
        isFundamental: false
      }
    ]
  }
};

export function generateDemoTeachingSuggestions({
  conceptTag,
  grade = 'Class 7',
  subject = 'Mathematics',
  classAccuracy = 50,
  relearnCount = 3,
  practiseCount = 5,
  advanceCount = 4,
  classification = 'Observed Assessment Pattern — Flagged for Review'
}) {
  const cleanTag = (conceptTag || 'Core Concept').trim();
  const preset = CONCEPT_PEDAGOGY_LIBRARY[cleanTag];

  if (preset) {
    return {
      mode: 'DEMO_MODE',
      modeBanner:
        'DEMO SUGGESTIONS — Generated locally from SAHAYA pedagogical templates based on observed concept tags and class accuracy. No live external AI service was called.',
      conceptTag: cleanTag,
      grade,
      subject,
      classAccuracy,
      classification,
      analogy: preset.analogy,
      commonMisconception: preset.commonMisconception,
      workedExample: preset.workedExample,
      activities: preset.activities,
      interventionPlan: [
        `Whole-Class Warmup (5 mins): Address the common misconception on "${cleanTag}" using the worked example on the blackboard before splitting into groups.`,
        `Teacher-Led Station (${relearnCount} students in Relearn Fundamentals): Walk through the visual/hands-on representation step by step and check the first 2 problems orally.`,
        `Guided Practice Pairs (${practiseCount} students in Practise): Assign targeted fluency questions on "${cleanTag}" with self-check answer cards.`,
        `Enrichment Group (${advanceCount} students in Advance): Assign multi-step application word problems and have them prepare 1 peer-explanation example.`
      ],
      followUpQuestions: preset.followUpQuestions
    };
  }

  // Dynamic fallback for any custom teacher-created concept tag!
  return {
    mode: 'DEMO_MODE',
    modeBanner:
      'DEMO SUGGESTIONS — Synthesized locally from SAHAYA pedagogical templates for your custom concept tag. No live external AI service was called.',
    conceptTag: cleanTag,
    grade,
    subject,
    classAccuracy,
    classification,
    analogy: `Start by connecting "${cleanTag}" (${subject}, ${grade}) to a concrete everyday classroom example before introducing formal symbols or definitions. Use a side-by-side comparison on the board showing a correct case and a non-example.`,
    commonMisconception: `When class accuracy on "${cleanTag}" is around ${classAccuracy}%, students commonly apply a surface-level rule without checking the underlying prerequisite condition. Ask 2 students to explain their steps aloud to pinpoint where reasoning diverges.`,
    workedExample: {
      problem: `Guided Blackboard Check on ${cleanTag}`,
      steps: [
        `Step 1: Identify what is given in the question and highlight the key term related to "${cleanTag}".`,
        `Step 2: Recall the core rule or relationship for "${cleanTag}" using a visual diagram or concrete numbers.`,
        `Step 3: Solve one step at a time on the board, pausing to ask students why each step is valid.`,
        `Step 4: Verify the final answer against the original question to confirm it makes sense.`
      ]
    },
    activities: {
      relearn: `Foundational Concept Circle (${relearnCount} students): Use concrete examples and guided fill-in-the-blank steps on "${cleanTag}" with immediate teacher feedback.`,
      practise: `Targeted Fluency Set (${practiseCount} students): Complete 4 graduated practice problems on "${cleanTag}" in pairs, checking each step against the board checklist.`,
      advance: `Application & Error-Spotting Challenge (${advanceCount} students): Present a worked solution on "${cleanTag}" containing a deliberate mistake; students must find, fix, and explain the error.`
    },
    interventionPlan: [
      `5-Minute Diagnostic Check: Write one foundational question on "${cleanTag}" on the blackboard and have students hold up option cards (A/B/C/D) to verify whether errors stemmed from the concept or question wording.`,
      `Small-Group Reteaching (${relearnCount} students): Convene the Relearn Fundamentals group at the front bench for a 10-minute guided walkthrough.`,
      `Reassess Next Session: Use the 3 follow-up MCQs below as a 5-minute exit ticket to verify whether accuracy on "${cleanTag}" improves above the class threshold.`
    ],
    followUpQuestions: [
      {
        text: `[Foundational Check] Which statement best describes the core rule of ${cleanTag}?`,
        options: [
          `Incorrect assumption often made in ${cleanTag}`,
          `Core principle and definition of ${cleanTag}`,
          `Unrelated rule from a previous topic`,
          `Partial rule missing key condition`
        ],
        correctOptionIndex: 1,
        conceptTag: cleanTag,
        isFundamental: true
      },
      {
        text: `[Direct Application] Apply ${cleanTag} to solve a standard ${grade} ${subject} problem:`,
        options: ['Distractor A (common calculation slip)', 'Correct application result', 'Distractor C (inverted operation)', 'Distractor D'],
        correctOptionIndex: 1,
        conceptTag: cleanTag,
        isFundamental: false
      },
      {
        text: `[Word Problem] In a real-world ${subject} scenario involving ${cleanTag}, which conclusion is valid?`,
        options: ['Conclusion A', 'Valid multi-step conclusion', 'Conclusion C', 'Conclusion D'],
        correctOptionIndex: 1,
        conceptTag: cleanTag,
        isFundamental: false
      }
    ]
  };
}

/**
 * Optional Live AI Server-Proxy request (never sends student names or PII).
 */
export async function fetchLiveProxySuggestions(proxyUrl, payload) {
  // Sanitize payload to strictly exclude any student names or IDs
  const anonymizedPayload = {
    conceptTag: payload.conceptTag,
    grade: payload.grade,
    subject: payload.subject,
    classAccuracy: payload.classAccuracy,
    relearnCount: payload.relearnCount,
    practiseCount: payload.practiseCount,
    advanceCount: payload.advanceCount,
    classification: payload.classification
  };

  const response = await fetch(proxyUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(anonymizedPayload)
  });

  if (!response.ok) {
    throw new Error(`Proxy returned HTTP ${response.status}`);
  }

  const data = await response.json();
  return {
    ...data,
    mode: 'LIVE_PROXY_MODE',
    modeBanner: 'LIVE AI PROXY — Generated via configured server-side proxy using anonymized concept metrics (zero student PII transmitted).'
  };
}
