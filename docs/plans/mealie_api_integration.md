# Mealie Recipe API Integration Plan

> **Status:** ✅ IMPLEMENTED (all 5 tasks done)

**Goal:** Provide the agent with connectivity to a local Mealie Docker instance (`http://100.77.8.92:9000`) so it can search, view, create, and delete recipes.

**Architecture:** Created `mealie` toolset in hermes-agent with three tools (`mealie_search_recipes`, `mealie_create_recipe`, `mealie_delete_recipe`).

**Tech Stack:** Python `requests` library, Mealie API v2 endpoints.

**Credentials:**
*   **Base URL:** `http://100.77.8.92:9000`
*   **API Token:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb25nX3Rva2VuIjp0cnVlLCJpZCI6ImU0YTliOWVkLWE1YWEtNDlkZi05Y2JlLWZjZTllNTVhZGQ4ZSIsIm5hbWUiOiJIZXJtZXMiLCJpbnRlZ3JhdGlvbl9pZCI6ImdlbmVyaWMiLCJleHAiOjE5MzQwNDUyMjR9.Zzz-bF4C1gheSzds6HoxwvdPS2wZWqeM_BlDc2HGTFQ`

---

## Implementation Notes (deviation from plan)

The original plan assumed `/api/recipes/search` endpoint, but Mealie v2 does not have this endpoint. Instead:

- **Search:** Uses `GET /api/recipes?page=1&per_page=50` to fetch all recipes, then filters by `name` and `tags` client-side. Fetches full detail via `GET /api/recipes/{id}` for ingredients/instructions.
- **Create:** `POST /api/recipes` returns the recipe slug as a string (not a JSON object with an `id` field).
- **Delete:** `DELETE /api/recipes/{id}` returns `200` (not `204`).
- **Recipe field naming:** Uses `name` (not `title`), `recipeIngredient` (with `food`/`quantity`/`unit`), `recipeInstructions` (with `text`/`summary`).

---

## Task 1: Connectivity Verification
**Status:** ✅ Done

Verified Mealie is reachable at `100.77.8.92:9000` with the API token. Found 44 recipes.

## Task 2: Tool Scaffold
**Status:** ✅ Done

Created `tools/mealie_tool.py` with full implementation (not scaffold).
Registered in `model_tools.py` and `toolsets.py`.

## Task 3: Search Implementation
**Status:** ✅ Done

Implemented client-side search using `GET /api/recipes` with pagination, filtering by name/tags. Fetches full detail for each match to get ingredients and instructions.

## Task 4: Create/Delete Implementation
**Status:** ✅ Done

- `mealie_create_recipe`: `POST /api/recipes` with JSON payload. Accepts `name` or `title` for the recipe name.
- `mealie_delete_recipe`: `DELETE /api/recipes/{id}`. Accepts both 200 and 204 status codes.

## Task 5: Final Verification
**Status:** ✅ Done

All three tools verified end-to-end:
- Search for "chicken" returns formatted summaries with ingredients, instructions, servings
- Create adds a recipe and returns the slug ID
- Delete removes the recipe and search confirms it's gone
