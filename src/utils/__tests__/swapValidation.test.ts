import { validateSwapEligibility, type FullPlant } from "../swapValidation";

// Mock data helpers
const createMockPlant = (overrides: Partial<FullPlant> = {}): FullPlant => ({
  id: 1,
  user_id: "user-1",
  nombre_comun: "Rose",
  nombre_cientifico: "Rosa rubiginosa",
  especie: "Rosa",
  familia: "Rosaceae",
  disponible: true,
  created_at: "2024-01-01T00:00:00Z",
  interval_days: 7,
  last_watered: "2024-01-01T00:00:00Z",
  image_url: null,
  profile: {
    id: "user-1",
    username: "gardener1",
    email: "test@example.com",
    created_at: "2024-01-01T00:00:00Z",
    cp: null,
    ciudad: null,
    lat: null,
    lng: null,
    avatar_url: null,
  },
  ...overrides,
});

describe("swapValidation", () => {
  describe("validateSwapEligibility", () => {
    it("should return invalid when user has no plants", () => {
      const targetPlant = createMockPlant({ user_id: "user-2" });
      const result = validateSwapEligibility([], targetPlant);

      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe(
        "You need to add your own plants before proposing swaps."
      );
    });

    it("should return invalid when user has no available plants", () => {
      const userPlants = [
        createMockPlant({ disponible: false }),
        createMockPlant({ id: 2, disponible: false }),
      ];
      const targetPlant = createMockPlant({ user_id: "user-2" });

      const result = validateSwapEligibility(userPlants, targetPlant);

      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain("don't have any available plants");
    });

    it("should return invalid when target plant is not available", () => {
      const userPlants = [createMockPlant()];
      const targetPlant = createMockPlant({
        user_id: "user-2",
        disponible: false,
      });

      const result = validateSwapEligibility(userPlants, targetPlant);

      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe(
        "This plant is no longer available for swapping."
      );
    });

    it("should return invalid when trying to swap with own plant", () => {
      const userPlants = [createMockPlant({ user_id: "user-1" })];
      const targetPlant = createMockPlant({ user_id: "user-1" });

      const result = validateSwapEligibility(userPlants, targetPlant);

      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe(
        "You cannot propose a swap with your own plants."
      );
    });

    it("should return valid for proper swap eligibility", () => {
      const userPlants = [createMockPlant({ user_id: "user-1" })];
      const targetPlant = createMockPlant({ user_id: "user-2" });

      const result = validateSwapEligibility(userPlants, targetPlant);

      expect(result.isValid).toBe(true);
      expect(result.errorMessage).toBeUndefined();
      expect(result.warningMessage).toBeUndefined();
    });

    it("should handle mixed available/unavailable user plants", () => {
      const userPlants = [
        createMockPlant({ id: 1, disponible: false }),
        createMockPlant({ id: 2, disponible: true }), // At least one available
        createMockPlant({ id: 3, disponible: false }),
      ];
      const targetPlant = createMockPlant({ user_id: "user-2" });

      const result = validateSwapEligibility(userPlants, targetPlant);

      expect(result.isValid).toBe(true);
    });

    it("should handle edge case with empty user plants array", () => {
      const targetPlant = createMockPlant({ user_id: "user-2" });
      const result = validateSwapEligibility([], targetPlant);

      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBeTruthy();
    });

    it("should validate user ID from first plant correctly", () => {
      const userPlants = [
        createMockPlant({ user_id: "current-user" }),
        createMockPlant({ id: 2, user_id: "current-user" }),
      ];
      const targetPlant = createMockPlant({ user_id: "current-user" });

      const result = validateSwapEligibility(userPlants, targetPlant);

      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe(
        "You cannot propose a swap with your own plants."
      );
    });

    it("should return valid when all conditions are met", () => {
      const userPlants = [
        createMockPlant({ id: 1, user_id: "user-1", disponible: true }),
        createMockPlant({ id: 2, user_id: "user-1", disponible: false }),
      ];
      const targetPlant = createMockPlant({
        id: 3,
        user_id: "user-2",
        disponible: true,
      });

      const result = validateSwapEligibility(userPlants, targetPlant);

      expect(result.isValid).toBe(true);
      expect(result.errorMessage).toBeUndefined();
      expect(result.warningMessage).toBeUndefined();
    });
  });
});
