#!/usr/bin/env Rscript
# Download score worm data for all AFL matches using fitzRoy,
# normalise each worm by its max absolute margin,
# and output as JSON for the backend.
# Run from repo root: Rscript server/scripts/download_worms.R

library(fitzRoy)
library(jsonlite)

OUTPUT_FILE <- "server/worm_cache.json"
cat("Output file:", OUTPUT_FILE, "\n")

SEASONS <- 2012:2025

all_worms <- list()

for (season in SEASONS) {
  cat("Fetching fixture for", season, "...\n")

  fixture <- tryCatch(
    fetch_fixture(season = season, comp = "AFLM"),
    error = function(e) {
      cat("  Error fetching fixture:", e$message, "\n")
      NULL
    }
  )

  if (is.null(fixture) || nrow(fixture) == 0) {
    cat("  No fixture data for", season, "\n")
    next
  }

  if (!("providerId" %in% names(fixture))) {
    cat("  No providerId column. Columns:", paste(names(fixture), collapse = ", "), "\n")
    next
  }

  match_ids <- unique(fixture$providerId)
  match_ids <- match_ids[!is.na(match_ids)]
  cat("  Found", length(match_ids), "matches\n")

  # Build lookups from fixture
  round_lookup <- setNames(fixture$round.roundNumber, fixture$providerId)
  home_lookup <- setNames(fixture$home.team.name, fixture$providerId)
  away_lookup <- setNames(fixture$away.team.name, fixture$providerId)

  for (mid in match_ids) {
    worm <- tryCatch(
      fetch_score_worm_data(mid),
      error = function(e) NULL
    )

    if (is.null(worm) || nrow(worm) == 0) next

    # Sort by cumulative seconds
    worm <- worm[order(worm$cumulativeSeconds), ]

    # Use scoreDifference column (home margin)
    points <- data.frame(
      time = worm$cumulativeSeconds / 60,
      margin = worm$scoreDifference
    )

    # Deduplicate times (keep last value at each time)
    points <- points[!duplicated(round(points$time), fromLast = TRUE), ]

    # Interpolate to integer minutes
    max_time <- max(points$time)
    if (max_time < 1) next
    minute_times <- seq(0, floor(max_time))
    minute_margins <- approx(points$time, points$margin, xout = minute_times, rule = 2)$y
    minute_margins <- round(minute_margins)

    # Normalise by max absolute margin
    max_abs <- max(abs(minute_margins))
    if (max_abs == 0) max_abs <- 1
    normalised <- minute_margins / max_abs

    all_worms[[length(all_worms) + 1]] <- list(
      matchId = mid,
      season = as.integer(season),
      round = as.integer(round_lookup[[mid]]),
      homeTeam = as.character(home_lookup[[mid]]),
      awayTeam = as.character(away_lookup[[mid]]),
      worm = lapply(seq_along(minute_times), function(i) {
        list(time = minute_times[i], margin = minute_margins[i])
      }),
      normalised = as.numeric(round(normalised, 4)),
      maxAbsMargin = max_abs
    )

    if (length(all_worms) %% 50 == 0) {
      cat("  Downloaded", length(all_worms), "worms so far...\n")
    }

    Sys.sleep(0.3)
  }

  cat("  Season", season, "done. Total worms:", length(all_worms), "\n")

  # Save progress after each season
  write_json(all_worms, OUTPUT_FILE, auto_unbox = TRUE, pretty = FALSE)
  cat("  Saved intermediate progress\n")
}

cat("\nDone! Total worms downloaded:", length(all_worms), "\n")
write_json(all_worms, OUTPUT_FILE, auto_unbox = TRUE, pretty = FALSE)
cat("Saved to", OUTPUT_FILE, "\n")
