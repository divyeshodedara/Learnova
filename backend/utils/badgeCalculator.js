const getBadgeLevel = (points) => {
  if (points >= 120) return "MASTER";
  if (points >= 100) return "EXPERT";
  if (points >= 80) return "SPECIALIST";
  if (points >= 60) return "ACHIEVER";
  if (points >= 40) return "EXPLORER";
  if (points >= 20) return "NEWBIE";
  return null;
};

module.exports = { getBadgeLevel };