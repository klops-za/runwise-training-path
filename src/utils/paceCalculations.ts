
export const calculateTrainingPaces = (fitnessScore: number) => {
  if (!fitnessScore || fitnessScore <= 0) {
    return {
      intervalPace: null,
      tempoPace: null,
      easyPace: null
    };
  }

  // Interval Training Pace calculation
  const intervalFitnessAdjusted = fitnessScore * 1.05;
  const intervalDenominator = 29.54 + 5.000663 * intervalFitnessAdjusted - 0.007546 * Math.pow(intervalFitnessAdjusted, 2);
  const intervalPace = (1 / intervalDenominator) * 1000 / 1440;

  // Tempo Training Pace calculation
  const tempoFitnessAdjusted = fitnessScore * 0.94;
  const tempoDenominator = 29.54 + 5.000663 * tempoFitnessAdjusted - 0.007546 * Math.pow(tempoFitnessAdjusted, 2);
  const tempoPace = (1 / tempoDenominator) * 1000 / 1440;

  // Easy Training Pace calculation
  const easyMultiplier = 0.59 + 0.41 * (0.8 - 0.65) / 0.35;
  const easyFitnessAdjusted = fitnessScore * easyMultiplier;
  const easyDenominator = 29.54 + 5.000663 * easyFitnessAdjusted - 0.007546 * Math.pow(easyFitnessAdjusted, 2);
  const easyPace = (1 / easyDenominator) * 1000.344 / 1440;

  console.log('Pace calculations:', {
    fitnessScore,
    intervalPace,
    tempoPace,
    easyPace,
    intervalDenominator,
    tempoDenominator,
    easyDenominator
  });

  return {
    intervalPace: intervalPace,
    tempoPace: tempoPace,
    easyPace: easyPace
  };
};

export const formatPace = (pace: number | null, unit: string = 'km'): string => {
  if (!pace || pace <= 0) return 'N/A';
  
  // Convert pace from fraction of day to minutes per unit
  // pace is currently in fraction of day, we need minutes per km/mile
  const paceMinutesPerUnit = pace * 1440; // Convert from fraction of day to minutes
  const minutes = Math.floor(paceMinutesPerUnit);
  const seconds = Math.round((paceMinutesPerUnit - minutes) * 60);
  
  return `${minutes}:${seconds.toString().padStart(2, '0')} min/${unit}`;
};
