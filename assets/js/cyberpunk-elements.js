/**
 * Cyberpunk Elements for Jekyll/Minimal Mistakes Blog
 * Add this script to your assets/js/ folder and include it in your _includes/scripts.html
 */

document.addEventListener('DOMContentLoaded', function() {
    // Apply cyberpunk styles to the archive subtitle
    const archiveSubtitle = document.querySelector('.archive__subtitle');
    if (archiveSubtitle) {
      archiveSubtitle.classList.add('glitch-text');
      archiveSubtitle.setAttribute('data-text', archiveSubtitle.textContent);
      
      // Change the subtitle text to be more cyberpunk
      archiveSubtitle.textContent = '// LATEST_INTEL_DROPS //';
      archiveSubtitle.setAttribute('data-text', '// LATEST_INTEL_DROPS //');
    }
    
    // Apply cyberpunk folder styling to each archive item
    const archiveItems = document.querySelectorAll('.archive__item');
    archiveItems.forEach((item, index) => {
      // Add folder tab with security indicator and file ID
      const folderTab = document.createElement('div');
      folderTab.className = 'folder-tab';
      
      // Security indicator (randomly assign or based on category)
      const securityIndicator = document.createElement('div');
      securityIndicator.className = 'security-indicator';
      
      // Assign security level based on category if available
      const categoryElement = item.querySelector('.archive__item-excerpt .page__meta-readtime');
      let securityLevel = getSecurityLevelFromCategory(categoryElement);
      securityIndicator.setAttribute('data-security', securityLevel);
      
      
      // Try to get date from meta data
      const dateElement = item.querySelector('.page__meta-date');
      if (dateElement) {
        folderDate.textContent = dateElement.textContent.trim();
      } else {
        // Default date format if no date found
        const today = new Date();
        folderDate.textContent = today.getFullYear() + '.' + 
          (today.getMonth() + 1).toString().padStart(2, '0') + '.' + 
          today.getDate().toString().padStart(2, '0');
      }
      
      // Assemble folder tab
      folderTab.appendChild(securityIndicator);
      folderTab.appendChild(folderID);
      folderTab.appendChild(folderDate);
      
      // Add folder tab to the beginning of the archive item
      item.insertBefore(folderTab, item.firstChild);
      
      // Add holographic icons
      const holoIcon = document.createElement('div');
      holoIcon.className = 'holographic-icon';
      for (let i = 0; i < 3; i++) {
        const span = document.createElement('span');
        holoIcon.appendChild(span);
      }
      item.appendChild(holoIcon);
    });
    
    // Function to determine security level based on category or tags
    function getSecurityLevelFromCategory(categoryElement) {
      if (!categoryElement) return 'medium';
      
      const categoryText = categoryElement.textContent.toLowerCase();
      
      // Check for keywords in category/tag to determine security level
      if (categoryText.includes('vulnerability') || 
          categoryText.includes('exploit') || 
          categoryText.includes('critical')) {
        return 'critical';
      } else if (categoryText.includes('hack') || 
                 categoryText.includes('attack') || 
                 categoryText.includes('threat')) {
        return 'high';
      } else if (categoryText.includes('guide') || 
                 categoryText.includes('tutorial') || 
                 categoryText.includes('best practice')) {
        return 'low';
      } else {
        return 'medium';
      }
    }
    
    // Optional: Add random glitch effect to titles occasionally
    setInterval(() => {
      const titles = document.querySelectorAll('.archive__item-title');
      const randomTitle = titles[Math.floor(Math.random() * titles.length)];
      
      if (randomTitle) {
        randomTitle.classList.add('glitch-effect');
        setTimeout(() => {
          randomTitle.classList.remove('glitch-effect');
        }, 500);
      }
    }, 5000);
  });
  