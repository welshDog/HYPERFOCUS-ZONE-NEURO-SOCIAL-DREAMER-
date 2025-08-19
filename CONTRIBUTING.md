# Contributing to HyperFocus Zone Neuro Social Dreamer

Welcome! We're thrilled you want to contribute to the world's first neurodivergent-focused social platform. This guide is designed with ADHD-friendly instructions and clear, actionable steps.

## ADHD-Friendly Contribution Process

### Quick Start (5 minutes)
1. **Fork the repository** (click the fork button)
2. **Clone your fork** to your local machine
3. **Create a branch** for your contribution
4. **Make your changes** in small, focused commits
5. **Submit a pull request** with a clear description

### Focus Areas We Need Help With

#### High Impact, Quick Wins
- **Accessibility improvements** (alt text, keyboard navigation, screen reader support)
- **ADHD-specific UX enhancements** (focus indicators, simplified navigation)
- **Bug fixes** with clear reproduction steps
- **Documentation improvements** (making guides clearer and more accessible)

#### Deeper Contributions
- **New neurodivergent-friendly features** (hyperfocus timers, interest-based filtering)
- **Performance optimizations** (faster loading, smoother animations)
- **AI integration improvements** (better coaching algorithms, smarter notifications)
- **Community moderation tools** (safe space enforcement, conflict resolution)

## Development Setup

### Prerequisites
- Node.js 18+ (use [nvm](https://github.com/nvm-sh/nvm) for easy version management)
- Git (with proper SSH keys set up)
- A code editor with accessibility extensions (we recommend VS Code)

### Quick Environment Setup
```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/HYPERFOCUS-ZONE-NEURO-SOCIAL-DREAMER.git
cd HYPERFOCUS-ZONE-NEURO-SOCIAL-DREAMER

# Install all dependencies
npm install

# Copy environment template
cp .env.template .env
# Fill in your API keys and configuration

# Start development environment
npm run docker:dev

# In separate terminals:
npm run dev:web    # Web app at http://localhost:3000
npm run dev:mobile # Mobile app development server
```

## Design Principles

When contributing, please keep these neurodivergent-focused principles in mind:

### Cognitive Load Reduction
- **Simplify complex interfaces** - break down multi-step processes
- **Use clear, descriptive labels** - avoid jargon or unclear terminology
- **Provide consistent navigation** - same actions should work the same way everywhere
- **Minimize decision fatigue** - offer smart defaults and clear recommendations

### Attention Management
- **Respect hyperfocus states** - avoid unnecessary interruptions
- **Support task switching** - make it easy to resume where someone left off
- **Use progressive disclosure** - show basic options first, advanced on request
- **Provide clear visual hierarchy** - most important things should stand out

### Sensory Considerations
- **Support customization** - themes, font sizes, animation preferences
- **Avoid overwhelming visuals** - too many colors, animations, or elements
- **Test with screen readers** - all functionality should be accessible
- **Consider motion sensitivity** - provide reduced motion options

## Code Standards

### Accessibility Requirements
- **All interactive elements must be keyboard accessible**
- **Include proper ARIA labels and descriptions**
- **Maintain color contrast ratios of 4.5:1 minimum**
- **Test with screen readers** (we recommend NVDA, JAWS, or VoiceOver)

### Code Quality
- **Write self-documenting code** with clear variable and function names
- **Include inline comments** for complex logic or accessibility considerations
- **Write tests** for new features and accessibility compliance
- **Follow TypeScript strict mode** for better error catching

### Commit Guidelines
We use a simplified commit format that's ADHD-friendly:

```
Brief description of what you did

Longer explanation if needed:
- What problem this solves
- How you tested it
- Any accessibility considerations
```

## Testing

### Before Submitting
- [ ] **Run accessibility tests**: `npm run test:a11y`
- [ ] **Test keyboard navigation**: Navigate entire feature with only keyboard
- [ ] **Test screen reader**: Use NVDA/VoiceOver to test all functionality
- [ ] **Test on mobile**: Ensure touch targets are large enough (44px minimum)
- [ ] **Run automated tests**: `npm test`

## Getting Help

### ADHD-Friendly Support
- **Stuck?** Create a draft pull request and ask for help in the description
- **Need clarification?** Open a discussion with your question
- **Want to pair program?** Mention in Discord that you're looking for a coding buddy
- **Feeling overwhelmed?** Break your contribution into smaller pieces - we're here to help!

### Communication Channels
- **Bug Reports**: [GitHub Issues](https://github.com/welshDog/HYPERFOCUS-ZONE-NEURO-SOCIAL-DREAMER/issues)
- **Feature Ideas**: [GitHub Discussions](https://github.com/welshDog/HYPERFOCUS-ZONE-NEURO-SOCIAL-DREAMER/discussions)
- **Questions**: Discord community or GitHub discussions
- **Urgent Issues**: Email community@hyperfocuszone.com

## Recognition

We believe in celebrating contributions! When you contribute:

- **Your name goes in our contributors list** with a link to your profile
- **Significant contributions** get featured in our monthly community newsletter
- **You earn BROski$ tokens** in our community economy system
- **First-time contributors** get a special welcome and mentorship offer

## Code of Conduct

Our community is built on **understanding, acceptance, and mutual support**. We have zero tolerance for:
- Ableism or discrimination against neurodivergent individuals
- Dismissing someone's needs or experiences
- Using language that stigmatizes mental health
- Making assumptions about someone's capabilities

Instead, we celebrate:
- **Different thinking styles** and problem-solving approaches
- **Questions and learning** - no question is too basic
- **Mistakes and iteration** - progress over perfection
- **Collaboration and mutual support** - we succeed together

## Ready to Contribute?

1. **Check out our [good first issues](https://github.com/welshDog/HYPERFOCUS-ZONE-NEURO-SOCIAL-DREAMER/labels/good%20first%20issue)**
2. **Join our Discord community** for real-time support and collaboration
3. **Read through our accessibility guidelines** in the docs folder
4. **Fork the repo and start coding!**

Remember: **Progress over perfection**. We're building this together, one contribution at a time. Your unique perspective as a neurodivergent developer (or ally) makes our platform better for everyone.

---

**Thank you for helping us build a more inclusive internet!**

*Every contribution, no matter how small, makes a difference in creating spaces where neurodivergent minds can thrive.*
