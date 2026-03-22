Write-Host "AutoCare Pro - Manual Azure Deployment Script" -ForegroundColor Cyan
Write-Host "This script overrides Azure containers with the newest Docker Hub images." -ForegroundColor Yellow
Write-Host "Wait until your GitHub Actions say 'Build and Push Docker Image - SUCCESS' before running this!`n"

# In Azure Container App Environments, ALL services get the exact same DNS suffix.
$Suffix = "gentlemushroom-35c31fca.southeastasia.azurecontainerapps.io"
$CV_URL = "https://customer-vehicle.$Suffix"
$APPT_URL = "https://appointment.$Suffix"
$JOB_URL = "https://job.$Suffix"
$PAY_URL = "https://payment.$Suffix"

# Secrets and Backend Configurations
$BASE_DB_URL = "postgresql://postgres.qtpnbjemcjdiidcgetui:Octagony4s25332@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres"
$JWT_SECRET = "autocare-super-secret-jwt-2026-sliit"

Write-Host "[1/6] Updating Customer & Vehicle Service..." -ForegroundColor Cyan
az containerapp update --name customer-vehicle --resource-group autocare-pro-rg --image rachcha/autocare-customer-vehicle:latest --set-env-vars APPOINTMENT_SERVICE_URL="$APPT_URL" NOTIFICATION_SERVICE_URL="$PAY_URL" DATABASE_URL="$BASE_DB_URL?search_path=cv" JWT_SECRET="$JWT_SECRET" | Out-Null

Write-Host "[2/6] Updating Appointment Service..." -ForegroundColor Cyan
az containerapp update --name appointment --resource-group autocare-pro-rg --image rachcha/autocare-appointment:latest --set-env-vars CUSTOMER_VEHICLE_SERVICE_URL="$CV_URL" JOB_SERVICE_URL="$JOB_URL" DATABASE_URL="$BASE_DB_URL?search_path=appointment" | Out-Null

Write-Host "[3/6] Updating Job Service..." -ForegroundColor Cyan
az containerapp update --name job --resource-group autocare-pro-rg --image rachcha/autocare-job:latest --set-env-vars CUSTOMER_VEHICLE_SERVICE_URL="$CV_URL" APPOINTMENT_SERVICE_URL="$APPT_URL" PAYMENT_SERVICE_URL="$PAY_URL" DATABASE_URL="$BASE_DB_URL?search_path=job" | Out-Null

Write-Host "[4/6] Updating Payment Service..." -ForegroundColor Cyan
az containerapp update --name payment --resource-group autocare-pro-rg --image rachcha/autocare-payment:latest --set-env-vars CUSTOMER_VEHICLE_SERVICE_URL="$CV_URL" JOB_SERVICE_URL="$JOB_URL" DATABASE_URL="$BASE_DB_URL?search_path=payment" | Out-Null

Write-Host "[5/6] Updating API Gateway..." -ForegroundColor Cyan
az containerapp update --name gateway --resource-group autocare-pro-rg --image rachcha/autocare-gateway:latest --set-env-vars PORT=80 CUSTOMER_VEHICLE_SERVICE_URL="$CV_URL" APPOINTMENT_SERVICE_URL="$APPT_URL" JOB_SERVICE_URL="$JOB_URL" PAYMENT_SERVICE_URL="$PAY_URL" FRONTEND_URL="https://frontend.$Suffix" | Out-Null

Write-Host "[6/6] Updating Frontend..." -ForegroundColor Cyan
az containerapp update --name frontend --resource-group autocare-pro-rg --image rachcha/autocare-frontend:latest --set-env-vars VITE_API_GATEWAY_URL="https://gateway.$Suffix" | Out-Null

Write-Host "`nAll 6 services have been successfully updated and cross-linked!" -ForegroundColor Green
Write-Host "Frontend is live at: https://frontend.$Suffix" -ForegroundColor Yellow
