import { describe, it, expect } from "vitest";
import { canonicalFor } from "@/lib/places";
import sample from "@/data/places.sample.json";

describe("canonicalFor", () => {
  it("keeps canonical to self for big city", () => {
    const london = sample.places.find(p => p.slug === "london")!;
    expect(canonicalFor(london)).toContain("/uk/london");
  });
  
  it("points to parent for small town", () => {
    const abingdon = sample.places.find(p => p.slug === "abingdon")!;
    expect(canonicalFor(abingdon)).toContain("/uk/oxford");
  });
  
  it("handles places without population data", () => {
    const placeWithoutPop = { ...sample.places[0], population: undefined };
    expect(canonicalFor(placeWithoutPop)).toContain("/uk/london");
  });
  
  it("handles places without parentSlug", () => {
    const placeWithoutParent = { ...sample.places[0], parentSlug: undefined };
    expect(canonicalFor(placeWithoutParent)).toContain("/uk/london");
  });
});

describe("Places Schema", () => {
  it("validates correct place data", () => {
    const validPlace = {
      slug: "test-city",
      name: "Test City",
      type: "city" as const,
      region: "England",
      lat: 51.5074,
      lon: -0.1278,
      population: 100000
    };
    
    expect(() => PlacesIndexSchema.parse({ 
      updatedAt: "2025-08-23T00:00:00.000Z",
      total: 1,
      places: [validPlace]
    })).not.toThrow();
  });
  
  it("rejects invalid coordinates", () => {
    const invalidPlace = {
      slug: "test-city",
      name: "Test City",
      type: "city" as const,
      region: "England",
      lat: 91, // Invalid latitude
      lon: -0.1278,
      population: 100000
    };
    
    expect(() => PlacesIndexSchema.parse({ 
      updatedAt: "2025-08-23T00:00:00.000Z",
      total: 1,
      places: [invalidPlace]
    })).toThrow();
  });
});
