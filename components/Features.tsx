export function Features() {
  const features = [
    {
      title: "Character Management",
      description: "Create and manage detailed character sheets with stats, inventory, and backstories.",
      icon: "🎭"
    },
    {
      title: "Campaign Tracking",
      description: "Keep track of your campaigns, sessions, and storylines in one organized place.",
      icon: "🗺️"
    },
    {
      title: "Dice Rolling",
      description: "Roll dice with beautiful animations and keep track of your rolls and results.",
      icon: "🎲"
    },
    {
      title: "Party Collaboration",
      description: "Share your campaigns with friends and collaborate on epic adventures together.",
      icon: "👥"
    }
  ];

  return (
    <section className="py-24 bg-white dark:bg-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Everything You Need for RPG
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Powerful tools designed by gamers, for gamers. Streamline your tabletop experience.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center p-6 rounded-lg bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
