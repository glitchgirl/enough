import { ImperfectionChallenge, BoundaryScript, BurnoutQuestion } from '../types';

export const IMPERFECTION_CHALLENGES: ImperfectionChallenge[] = [
  // Tier 1: Micro-Glitches (Low stakes)
  {
    id: 'typo-email',
    tier: 1,
    title: 'The Intentional Typo',
    description: 'Send a quick casual email or chat message to a friend or colleague with one tiny, harmless typo (e.g., "teh" or "seeyou") without immediately correcting it.',
    rationale: 'Teaches your nervous system that small errors do not destroy relationships or professional credibility.',
    promptExample: 'Notice the urge to edit or add a frantic asterisk explanation. Let it sit.'
  },
  {
    id: 'unmade-bed',
    tier: 1,
    title: 'The Unmade Blanket',
    description: 'Leave your bed completely unmade for one full afternoon or day without straightening a single corner.',
    rationale: 'Dissolves the subconscious rule that your physical environment must be pristine before you deserve peace.',
    promptExample: 'Walk past it once and whisper: "This room is lived in, not staged."'
  },
  {
    id: 'no-punctuation-chat',
    tier: 1,
    title: 'The Casual Text',
    description: 'Reply to a low-stakes text message with lowercase text, no period at the end, or a quick 2-word answer.',
    rationale: 'Counters the anxiety that people-pleasers experience over "sounding cold" unless they add three exclamation points.',
    promptExample: 'Replace "Thanks so much! 😊 Have a wonderful day!" with "thanks, got it"'
  },

  // Tier 2: Environmental Friction & Lingering Imperfection
  {
    id: 'dish-in-sink',
    tier: 2,
    title: 'One Dish in the Sink Overnight',
    description: 'Leave exactly one mug or small bowl in the sink overnight. Go to sleep with it resting there peacefully.',
    rationale: 'Exposes and softens the compulsive urge to achieve a "zero state" before allowing oneself to rest.',
    promptExample: 'Look at the dish before turning off the kitchen light. Say: "Rest comes first."'
  },
  {
    id: 'mismatched-walk',
    tier: 2,
    title: 'The Non-Coordinated Step',
    description: 'Go on a 15-minute neighborhood walk or run a quick errand wearing socks of different colors, or an outfit that does not match.',
    rationale: 'Disarms hyper-vigilance about how strangers perceive your external presentation.',
    promptExample: 'Notice how nobody looks twice, and even if they do, the sun still shines.'
  },
  {
    id: 'messy-desk-cutoff',
    tier: 2,
    title: 'The 5:00 PM Abrupt Close',
    description: 'When your work day ends, close your laptop immediately without spending 20 minutes organizing tabs or filing desktop folders.',
    rationale: 'Interrupts the perfectionist trap of "just clearing one more thing" which steals entire evenings.',
    promptExample: 'Leave the open documents. Tomorrow-you has the capacity; evening-you needs rest.'
  },

  // Tier 3: Output & Creative Courage
  {
    id: 'eighty-percent-finish',
    tier: 3,
    title: 'The 80% Good Enough Draft',
    description: 'Work on a document, sketch, plan, or personal project until it reaches approximately 80% completion. Stop and step away for at least 24 hours.',
    rationale: 'The final 20% of perfectionism consumes 80% of your emotional energy for marginal real-world benefit.',
    promptExample: 'Declare it: "This is fully functional and sufficient for this stage."'
  },
  {
    id: 'no-second-guess',
    tier: 3,
    title: 'Single-Pass Submission',
    description: 'Write a memo, summary, or report, proofread it only ONCE (instead of 4 or 5 times), and press Send.',
    rationale: 'Builds confidence in your baseline competence and stops obsessive re-checking.',
    promptExample: 'Take a deep breath and hit send with a quiet grin.'
  },
  {
    id: 'imperfect-creative',
    tier: 3,
    title: 'The No-Eraser Sketch or Doodle',
    description: 'Draw, write, or brainstorm on a physical piece of paper or blank digital note with a pen or irreversible stroke. No erasing, no backspacing allowed.',
    rationale: 'Celebrates raw spontaneity over curated control.',
    promptExample: 'If a crooked line happens, turn it into part of the scenery.'
  }
];

export const BOUNDARY_SCRIPTS: BoundaryScript[] = [
  {
    id: 'work-full-capacity',
    category: 'work',
    title: 'Capacity Is Full',
    situation: 'A manager or coworker asks you to take on an urgent new task when your schedule is already overflowing.',
    script: 'Thank you for thinking of me for this. Looking at my current commitments, my capacity is full for the rest of the week. To take this on, we would need to deprioritize [Project A]. Let me know which is the higher priority, otherwise I can look at this next Tuesday.',
    explanation: 'Shifts the trade-off back to the requester rather than absorbing personal burnout.'
  },
  {
    id: 'work-after-hours',
    category: 'work',
    title: 'Evening Slack or Email',
    situation: 'A colleague messages you outside normal working hours on a non-emergency topic.',
    script: 'Hi [Name], I am logging off for the evening to recharge. I have noted this and will review it first thing tomorrow morning when back at my desk.',
    explanation: 'Establishes clear asynchronous norms without apology.'
  },
  {
    id: 'work-unreasonable-deadline',
    category: 'work',
    title: 'Pushing Back on Unrealistic Turnaround',
    situation: 'Someone requests a complex deck or analysis with an impossible same-day turnaround.',
    script: 'To give this the quality and attention it requires, the earliest I can deliver a thorough draft is Thursday afternoon. If you need an outline sooner, I can share my initial notes by tomorrow midday.',
    explanation: 'Protects against late-night sprint crunches while offering realistic milestones.'
  },
  {
    id: 'social-declining-invitation',
    category: 'social',
    title: 'Warmly Declining a Social Gathering',
    situation: 'You are invited to a dinner or event, but your social energy battery is completely depleted.',
    script: 'Thank you so much for the invite! I really appreciate being included, but my energy reserves are on empty this week and I need a quiet night to recharge. I would love to catch up when things settle down.',
    explanation: 'Validates the friendship while honoring your emotional requirement for rest.'
  },
  {
    id: 'social-leaving-early',
    category: 'social',
    title: 'Graceful Early Departure',
    situation: 'You attended an event, but have hit your limit and need to leave before others do.',
    script: 'I had such a lovely time seeing everyone, but my battery is tapped out so I am going to head home now. Thank you for having me!',
    explanation: 'Eliminates the need to fabricate elaborate excuses for going to sleep.'
  },
  {
    id: 'personal-delayed-response',
    category: 'personal',
    title: 'Taking Time Before Answering',
    situation: 'Someone puts you on the spot in person or on a phone call demanding an instant yes.',
    script: 'I want to consider that thoughtfully before committing. Let me check my schedule and energy, and I will get back to you by tomorrow afternoon.',
    explanation: 'Breaks the instinctive "people-pleasing yes" reflex in real-time.'
  },
  {
    id: 'personal-unsolicited-advice',
    category: 'personal',
    title: 'Deflecting Well-Meaning Perfectionist Advice',
    situation: 'A family member or friend critiques how you do something or urges you to optimize more.',
    script: 'I appreciate you caring, but the way I am handling this right now is working well for my mental well-being, even if it is not the most optimized way.',
    explanation: 'Affirms that your peace is worth more than their definition of efficiency.'
  },
  {
    id: 'time-protecting-lunch',
    category: 'time',
    title: 'Guarding Your Midday Rest',
    situation: 'Colleagues consistently schedule meetings over your lunchtime or rest window.',
    script: 'I have a recurring focus and recovery block during that window. I am available anytime between 1:30 PM and 4:00 PM instead.',
    explanation: 'Frames rest as non-negotiable health maintenance.'
  }
];

export const BURNOUT_QUESTIONS: BurnoutQuestion[] = [
  {
    id: 1,
    question: 'When you wake up and think about the day ahead, how do you feel emotionally?',
    dimension: 'exhaustion',
    options: [
      { label: 'Rested and curious', score: 0 },
      { label: 'A bit tired, but ready to manage', score: 1 },
      { label: 'Drained before the day even begins', score: 2 },
      { label: 'Completely depleted, with a heavy knot of dread', score: 3 }
    ]
  },
  {
    id: 2,
    question: 'How do you feel toward the people around you (coworkers, family, friends)?',
    dimension: 'detachment',
    options: [
      { label: 'Warm, empathetic, and connected', score: 0 },
      { label: 'Mostly patient, occasional mild annoyance', score: 1 },
      { label: 'Detached or quick to feel irritable', score: 2 },
      { label: 'Completely numb, cynical, or wishing everyone would disappear', score: 3 }
    ]
  },
  {
    id: 3,
    question: 'When you complete a task or project, how does it register in your body?',
    dimension: 'inefficacy',
    options: [
      { label: 'Satisfaction and genuine quiet pride', score: 0 },
      { label: 'Relief that it is finished', score: 1 },
      { label: 'Hardly noticeable, immediately replaced by the next worry', score: 2 },
      { label: 'Nothing feels meaningful or "good enough" regardless of outcome', score: 3 }
    ]
  },
  {
    id: 4,
    question: 'What is your relationship to taking breaks or resting during the day?',
    dimension: 'exhaustion',
    options: [
      { label: 'I rest naturally without guilt', score: 0 },
      { label: 'I can rest, though my mind sometimes wanders to tasks', score: 1 },
      { label: 'I feel anxious or guilty when sitting still', score: 2 },
      { label: 'Rest feels like a moral failure I have not earned', score: 3 }
    ]
  },
  {
    id: 5,
    question: 'How do you react when something you did has a small imperfection or delay?',
    dimension: 'inefficacy',
    options: [
      { label: 'I shrug it off; to err is human', score: 0 },
      { label: 'Mild cringe, then I adjust and move on', score: 1 },
      { label: 'I replay it repeatedly in my head for hours', score: 2 },
      { label: 'Catastrophizing: I feel like a total fraud or failure', score: 3 }
    ]
  }
];

export const PERMISSION_SLIPS = [
  {
    id: 'b-minus',
    title: 'Permission to do B- work',
    text: 'You are allowed to turn in work that is simply adequate. The world will not notice, and your nervous system will thank you.',
    category: 'Work'
  },
  {
    id: 'close-laptop',
    title: 'Permission to close your screen now',
    text: 'There will always be another unread email. The inbox is infinite; your lifespan is finite. Close the lid.',
    category: 'Rest'
  },
  {
    id: 'disappoint-someone',
    title: 'Permission to disappoint someone',
    text: 'Disappointing someone else to preserve your sanity is not cruelty. It is self-respect.',
    category: 'Boundaries'
  },
  {
    id: 'rest-unearned',
    title: 'Permission to rest without earning it',
    text: 'You do not need to check 10 items off a list to qualify for a nap, a walk, or a quiet cup of tea. Being alive is enough.',
    category: 'Living'
  },
  {
    id: 'be-unproductive',
    title: 'Permission to have an unproductive day',
    text: 'Today is allowed to just pass. You do not need to produce, optimize, or monetize your existence every second.',
    category: 'Patience'
  }
];
