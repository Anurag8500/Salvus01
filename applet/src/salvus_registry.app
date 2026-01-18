record PlatformStats {
  total_campaigns: u64,
  active_campaigns: u64,
  total_raised: u64
}

interface SalvusRegistry {
  query func get_platform_stats() -> PlatformStats;
}
