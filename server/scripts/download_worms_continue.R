#!/usr/bin/env Rscript
# Continue downloading worms from where we left off.
# Loads existing worm_cache.json and appends new seasons.

library(fitzRoy)
library(jsonlite)

OUTPUT_FILE <- "server/worm_cache.json"

# Load existing data
if (file.exists(OUTPUT_FILE)) {
  all_worms <- fromJSON(OUTPUT_FILE, simplifyVector = FALSE)
  cat("Loaded", length(all_worms), "existing worms\n")
} else {
  all_worms <- list()
}

# Figure out which seasons we already have
existing_seasons <- unique(sapply(all_worms, function(w) w$season))
cat("Already have seasons:", paste(sort(existing_seasons), collapse = ", "), "\n")

SEASONS <- 2017:2025

for (season in SEASONS) {
  if (season %in% existing_seasons) {
    cat("Skipping", season, "(already downloaded)\n")
    next
  }

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
    cat("  No providerId column.\n")
    next
  }

  match_ids <- unique(fixture$providerId)
  match_ids <- match_ids[!is.na(match_ids)]
  cat("  Found", length(match_ids), "matches\n")

  round_lookup <- setNames(fixture$round.roundNumber, fixture$providerId)
  home_lookup <- setNames(fixture$home.team.name, fixture$providerId)
  away_lookup <- setNames(fixture$away.team.name, fixture$providerId)

  for (mid in match_ids) {
    worm <- tryCatch(
      fetch_score_worm_data(mid),
      error = function(e) NULL
    )

    if (is.null(worm) || nrow(worm) == 0) next

    worm <- worm[order(worm$cumulativeSeconds), ]

    points <- data.frame(
      time = worm$cumulativeSeconds / 60,
      margin = worm$scoreDifference
    )

    # Remove NAs
    points <- points[complete.cases(points), ]
    if (nrow(points) < 2) next

    points <- points[!duplicated(round(points$time), fromLast = TRUE), ]

    max_time <- max(points$time, na.rm = TRUE)
    if (is.na(max_time) || max_time < 1) next
    minute_times <- seq(0, floor(max_time))
    minute_margins <- approx(points$time, points$margin, xout = minute_times, rule = 2)$y
    minute_margins <- round(minute_margins)

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
  write_json(all_worms, OUTPUT_FILE, auto_unbox = TRUE, pretty = FALSE)
  cat("  Saved intermediate progress\n")
}

cat("\nDone! Total worms:", length(all_worms), "\n")
write_json(all_worms, OUTPUT_FILE, auto_unbox = TRUE, pretty = FALSE)
cat("Saved to", OUTPUT_FILE, "\n")
