#!/usr/bin/env Rscript
# Fetch score worm data for a given season using fitzRoy.
# Outputs server/worms_raw.json:
#   [{matchId, season, round, homeTeam, awayTeam, margins: [int], maxAbsMargin}]
#
# Usage: Rscript server/scripts/fetch_worms_year.R [year]
#        year defaults to current year

library(fitzRoy)
library(jsonlite)

args     <- commandArgs(trailingOnly = TRUE)
SEASON   <- if (length(args) > 0) as.integer(args[1]) else as.integer(format(Sys.Date(), "%Y"))
OUT_FILE <- "server/worms_raw.json"

cat(sprintf("Fetching worms for %d...\n", SEASON))

fixture <- tryCatch(
  fetch_fixture(season = SEASON, comp = "AFLM"),
  error = function(e) { cat("Fixture error:", e$message, "\n"); NULL }
)

if (is.null(fixture) || nrow(fixture) == 0) {
  cat("No fixture data — writing empty output.\n")
  write_json(list(), OUT_FILE)
  quit(status = 0)
}

match_ids    <- unique(fixture$providerId[!is.na(fixture$providerId)])
round_lookup <- setNames(fixture$round.roundNumber, fixture$providerId)
home_lookup  <- setNames(fixture$home.team.name,    fixture$providerId)
away_lookup  <- setNames(fixture$away.team.name,    fixture$providerId)

cat(sprintf("Found %d matches in fixture\n", length(match_ids)))

all_worms <- list()

for (mid in match_ids) {
  worm <- tryCatch(fetch_score_worm_data(mid), error = function(e) NULL)

  if (is.null(worm) || nrow(worm) == 0) {
    cat(sprintf("  %s: no data\n", mid))
    next
  }

  worm <- worm[order(worm$cumulativeSeconds), ]
  pts  <- data.frame(
    time   = worm$cumulativeSeconds / 60,
    margin = worm$scoreDifference
  )
  pts <- pts[!duplicated(round(pts$time), fromLast = TRUE), ]

  max_time <- max(pts$time)
  if (max_time < 1) next

  minute_times   <- seq(0, floor(max_time))
  minute_margins <- round(approx(pts$time, pts$margin, xout = minute_times, rule = 2)$y)

  max_abs <- max(abs(minute_margins))
  if (max_abs == 0) max_abs <- 1

  all_worms[[length(all_worms) + 1]] <- list(
    matchId      = mid,
    season       = as.integer(SEASON),
    round        = as.integer(round_lookup[[mid]]),
    homeTeam     = as.character(home_lookup[[mid]]),
    awayTeam     = as.character(away_lookup[[mid]]),
    margins      = as.integer(minute_margins),
    maxAbsMargin = as.numeric(max_abs)
  )

  cat(sprintf("  %s: R%d %s v %s (%d mins)\n",
      mid, round_lookup[[mid]], home_lookup[[mid]], away_lookup[[mid]], length(minute_margins)))

  Sys.sleep(0.3)
}

cat(sprintf("\nDone. %d worms written to %s\n", length(all_worms), OUT_FILE))
write_json(all_worms, OUT_FILE, auto_unbox = TRUE, pretty = FALSE)
