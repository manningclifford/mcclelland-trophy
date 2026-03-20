#!/usr/bin/env Rscript
# Patch game_evolution.json with missing 2023 data.
# Run from repo root: Rscript server/scripts/patch_2023.R

library(fitzRoy)
library(jsonlite)

OUTPUT_FILE <- "public/game_evolution.json"
YEAR <- 2023

cat("Patching 2023 data into game_evolution.json...\n")

# Helper: is a round label a regular-season round?
is_regular_round <- function(r) suppressWarnings(!is.na(as.integer(r)))

# ---- Game-level results ----------------------------------------------------
results <- tryCatch(
  fetch_results(season = YEAR, source = "afltables"),
  error = function(e) { cat("  results error:", e$message, "\n"); NULL }
)

if (is.null(results) || nrow(results) == 0) {
  stop("Failed to fetch 2023 results — try again later.")
}

reg <- results[results$Round.Type == "Regular" &
                 !is.na(results$Home.Points) &
                 !is.na(results$Away.Points), ]

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

cat(sprintf("  Results: %d games, avg score %.1f, avg margin %.1f\n",
            games, game_stats$avgTotalScore, game_stats$avgMargin))

# ---- Player-level stats ----------------------------------------------------
player_stats <- tryCatch(
  fetch_player_stats(season = YEAR, source = "afltables"),
  error = function(e) { cat("  player stats error:", e$message, "\n"); NULL }
)

player_agg <- list(
  avgKicks = NA, avgHandballs = NA, avgDisposals = NA,
  avgMarks = NA, avgTackles = NA, avgClearances = NA,
  avgHitouts = NA, avgInside50s = NA, avgContested = NA
)

if (!is.null(player_stats) && nrow(player_stats) > 0) {
  ps <- player_stats[is_regular_round(player_stats$Round), ]
  if ("Time.on.Ground" %in% names(ps)) {
    ps <- ps[!is.na(ps$Time.on.Ground) & ps$Time.on.Ground > 0, ]
  }
  if (nrow(ps) > 0) {
    stat_cols <- c("Kicks", "Handballs", "Disposals", "Marks", "Tackles",
                   "Clearances", "Hit.Outs", "Inside.50s", "Contested.Possessions")
    stat_cols <- stat_cols[stat_cols %in% names(ps)]
    game_totals <- aggregate(
      ps[, stat_cols, drop = FALSE],
      by = list(ps$Season, ps$Round, ps$Home.team),
      FUN = function(x) sum(x, na.rm = TRUE)
    )
    avg_game <- function(col) {
      if (col %in% names(game_totals)) round(mean(game_totals[[col]], na.rm = TRUE), 0) else NA
    }
    player_agg$avgKicks      <- avg_game("Kicks")
    player_agg$avgHandballs  <- avg_game("Handballs")
    player_agg$avgDisposals  <- avg_game("Disposals")
    player_agg$avgMarks      <- avg_game("Marks")
    player_agg$avgTackles    <- avg_game("Tackles")
    player_agg$avgClearances <- avg_game("Clearances")
    player_agg$avgHitouts    <- avg_game("Hit.Outs")
    player_agg$avgInside50s  <- avg_game("Inside.50s")
    player_agg$avgContested  <- avg_game("Contested.Possessions")
    cat(sprintf("  Player: %d games, disp=%.0f, tack=%.0f, clear=%.0f\n",
                nrow(game_totals),
                ifelse(is.na(player_agg$avgDisposals), 0, player_agg$avgDisposals),
                ifelse(is.na(player_agg$avgTackles), 0, player_agg$avgTackles),
                ifelse(is.na(player_agg$avgClearances), 0, player_agg$avgClearances)))
  }
}

new_entry <- c(list(year = YEAR), game_stats, player_agg)

# ---- Patch the existing JSON -----------------------------------------------
existing <- read_json(OUTPUT_FILE, simplifyVector = FALSE)
seasons  <- existing$seasons

# Remove any existing 2023 entry, then insert in sorted order
seasons <- seasons[sapply(seasons, function(s) s$year != YEAR)]
seasons <- c(seasons, list(new_entry))
seasons <- seasons[order(sapply(seasons, function(s) s$year))]

existing$seasons     <- seasons
existing$generatedAt <- format(Sys.time(), "%Y-%m-%dT%H:%M:%SZ")

write_json(existing, OUTPUT_FILE, auto_unbox = TRUE, pretty = FALSE)
cat(sprintf("Done! 2023 patched in. Total seasons: %d\n", length(seasons)))
