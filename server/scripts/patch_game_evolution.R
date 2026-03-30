#!/usr/bin/env Rscript
# Patch game_evolution.json — fetches only years missing from the existing file.
# Run from repo root: Rscript server/scripts/patch_game_evolution.R

local_lib <- Sys.getenv("R_LIBS_USER", unset = "")
if (nchar(local_lib) > 0) .libPaths(c(local_lib, .libPaths()))

library(fitzRoy)
library(jsonlite)

OUTPUT_FILE <- "public/game_evolution.json"
FIRST_YEAR  <- 1990
LAST_YEAR   <- as.integer(format(Sys.Date(), "%Y"))

is_regular_round <- function(r) suppressWarnings(!is.na(as.integer(r)))

# Load existing data
existing <- read_json(OUTPUT_FILE, simplifyVector = FALSE)
existing_years <- sapply(existing$seasons, function(s) s$year)
cat(sprintf("Existing seasons: %d (%d–%d)\n", length(existing_years),
            min(existing_years), max(existing_years)))

missing_years <- setdiff(FIRST_YEAR:LAST_YEAR, existing_years)
cat(sprintf("Missing years: %s\n\n", paste(missing_years, collapse = ", ")))

if (length(missing_years) == 0) {
  cat("Nothing to patch.\n"); quit(save = "no")
}

seasons_list <- existing$seasons

for (year in missing_years) {
  cat(sprintf("=== %d ===\n", year))

  results <- tryCatch(
    fetch_results(season = year, source = "afltables"),
    error = function(e) { cat("  results error:", e$message, "\n"); NULL }
  )
  if (is.null(results) || nrow(results) == 0) { cat("  No results – skipping\n"); next }

  reg <- results[results$Round.Type == "Regular" &
                   !is.na(results$Home.Points) &
                   !is.na(results$Away.Points), ]
  if (nrow(reg) == 0) { cat("  No completed regular-season games – skipping\n"); next }

  total_score   <- reg$Home.Points + reg$Away.Points
  margin        <- abs(reg$Margin)
  winning_score <- pmax(reg$Home.Points, reg$Away.Points)
  games         <- nrow(reg)
  home_wins     <- sum(reg$Margin > 0, na.rm = TRUE)
  draws         <- sum(reg$Margin == 0, na.rm = TRUE)
  total_goals   <- sum(reg$Home.Goals + reg$Away.Goals, na.rm = TRUE)
  total_beh     <- sum(reg$Home.Behinds + reg$Away.Behinds, na.rm = TRUE)
  scoring_shots <- total_goals + total_beh

  game_stats <- list(
    gamesPlayed       = games,
    avgTotalScore     = round(mean(total_score, na.rm = TRUE), 1),
    avgMargin         = round(mean(margin, na.rm = TRUE), 1),
    avgWinningScore   = round(mean(winning_score, na.rm = TRUE), 1),
    closePct          = round(100 * mean(margin <= 12, na.rm = TRUE), 1),
    blowoutPct        = round(100 * mean(margin > 50, na.rm = TRUE), 1),
    homeWinPct        = round(100 * home_wins / games, 1),
    drawRate          = round(100 * draws / games, 2),
    scoringEfficiency = if (scoring_shots > 0) round(100 * total_goals / scoring_shots, 1) else NA,
    avgGoalsPerGame   = round(mean(reg$Home.Goals + reg$Away.Goals, na.rm = TRUE), 1),
    avgBehindsPerGame = round(mean(reg$Home.Behinds + reg$Away.Behinds, na.rm = TRUE), 1)
  )

  player_agg <- list(
    avgKicks = NA, avgHandballs = NA, avgDisposals = NA,
    avgMarks = NA, avgTackles = NA, avgClearances = NA,
    avgHitouts = NA, avgInside50s = NA, avgContested = NA,
    avgFreeKicks = NA, avgOnePercent = NA
  )

  player_stats <- tryCatch(
    fetch_player_stats(season = year, source = "afltables"),
    error = function(e) { cat("  player stats error:", e$message, "\n"); NULL }
  )

  if (!is.null(player_stats) && nrow(player_stats) > 0) {
    ps <- player_stats[is_regular_round(player_stats$Round), ]
    if ("Time.on.Ground" %in% names(ps))
      ps <- ps[!is.na(ps$Time.on.Ground) & ps$Time.on.Ground > 0, ]

    if (nrow(ps) > 0) {
      stat_cols <- c("Kicks","Handballs","Disposals","Marks","Tackles",
                     "Clearances","Hit.Outs","Inside.50s","Contested.Possessions",
                     "Frees.For","One.Percenters")
      stat_cols <- stat_cols[stat_cols %in% names(ps)]
      game_totals <- aggregate(ps[, stat_cols, drop = FALSE],
                               by = list(ps$Season, ps$Round, ps$Home.team),
                               FUN = function(x) sum(x, na.rm = TRUE))
      avg_game <- function(col)
        if (col %in% names(game_totals)) round(mean(game_totals[[col]], na.rm=TRUE), 0) else NA

      player_agg$avgKicks      <- avg_game("Kicks")
      player_agg$avgHandballs  <- avg_game("Handballs")
      player_agg$avgDisposals  <- avg_game("Disposals")
      player_agg$avgMarks      <- avg_game("Marks")
      player_agg$avgTackles    <- avg_game("Tackles")
      player_agg$avgClearances <- avg_game("Clearances")
      player_agg$avgHitouts    <- avg_game("Hit.Outs")
      player_agg$avgInside50s  <- avg_game("Inside.50s")
      player_agg$avgContested  <- avg_game("Contested.Possessions")
      player_agg$avgFreeKicks  <- avg_game("Frees.For")
      player_agg$avgOnePercent <- avg_game("One.Percenters")
      cat(sprintf("  Player: disp=%.0f, tack=%.0f, frees=%.0f, 1pct=%.0f\n",
                  ifelse(is.na(player_agg$avgDisposals),0,player_agg$avgDisposals),
                  ifelse(is.na(player_agg$avgTackles),0,player_agg$avgTackles),
                  ifelse(is.na(player_agg$avgFreeKicks),0,player_agg$avgFreeKicks),
                  ifelse(is.na(player_agg$avgOnePercent),0,player_agg$avgOnePercent)))
    }
  }

  seasons_list[[length(seasons_list) + 1]] <- c(list(year = year), game_stats, player_agg)
  cat(sprintf("  Added. Total seasons so far: %d\n", length(seasons_list)))

  # Sort by year and save after each season
  seasons_list <- seasons_list[order(sapply(seasons_list, function(s) s$year))]
  write_json(
    list(firstYear = FIRST_YEAR, lastYear = LAST_YEAR,
         generatedAt = format(Sys.time(), "%Y-%m-%dT%H:%M:%SZ"),
         seasons = seasons_list),
    OUTPUT_FILE, auto_unbox = TRUE, pretty = FALSE
  )
}

cat(sprintf("\nDone! %d total seasons in %s\n", length(seasons_list), OUTPUT_FILE))
