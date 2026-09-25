# ThinkCode — Design System Direction

## Product Feel

ThinkCode should feel:

- Clean.
- Educational.
- Technical.
- Focused.
- Modern.
- Calm.
- Logic-first and code-first where the lesson needs code.

Avoid:

- AI-slop visual style.
- Excessive gradients.
- Decorative 3D illustrations everywhere.
- Excessive glassmorphism.
- Too many floating cards.
- Excessive icons.
- Emoji-driven UI.

## Inspiration

Conceptual mix:

- Codecademy: structured learning.
- LeetCode: exercise/editor workflow.
- VS Code: code-first familiarity.

Do not clone any product visually.

## Layout Principles

- Strong hierarchy.
- Clear content/editor separation.
- Maximize usable editor area.
- Keep progress visible but unobtrusive.
- Contextual actions close to the relevant content.
- Keep **Predict → Run → Visualize → Check** distinct and legible. The execution trace should explain a state change at each step.

## Responsive Strategy

Desktop and mobile should have intentionally different layouts where needed.

Desktop:

- Multi-panel learning workspace.

Mobile:

- Tab-based workspace.
- Larger touch targets.
- Avoid horizontal squeezing.

## Theme

The application theme selector supports:

- Light
- Dark
- System preference

The lesson Monaco editor follows the resolved application theme. UI colors use semantic CSS variables so content, dialogs, controls, and workspace panels stay consistent across themes.

## Typography

- Highly readable sans-serif for UI/content.
- Monospace font for code.
- Clear distinction between lesson prose and code.

## Components

Core component categories:

- Button
- Input
- Dialog
- Sheet
- Tabs
- Progress
- Alert
- Tooltip
- Card
- Code editor shell
- Console panel
- Execution visualizer with Previous, Next, Play, Pause, Reset and bounded trace notice
- Prediction and actual-output comparison
- Bug Lab observation and repair flow
- Exercise panel
- AI Tutor panel
- Locked lesson item
- Assessment status

Use shadcn/ui as primitives, not as a visual identity.
